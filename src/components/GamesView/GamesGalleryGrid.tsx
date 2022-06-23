import { useEffect, useCallback } from "react";
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import useInfiniteLoader from 'react-use-infinite-loader';
import { useTranslation } from "react-i18next";
import Alert from '@mui/material/Alert';

// Style
import Grid from "@mui/material/Grid";

// Custom
// @ts-ignore
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
// @ts-ignore
import CardEntry from "./CardEntry.tsx";
// @ts-ignore
import GamesSorters from "./GamesSorters.tsx";
// @ts-ignore
import GenresSelect from "./GenresSelect.tsx";
// @ts-ignore
import PlatformSelect from "./PlatformSelect.tsx";
// @ts-ignore
import TitleFilter from "./TitleFilter.tsx";

// Redux
import { 
    fetchGames,
    scrollingFetching,
    generate_sort_function,
    generate_filter_function,
} 
// @ts-ignore
from "../../services/gamesSlice.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';

const PREFIX = 'GamesGalleryGrid';

const classes = {
    gameEntry: `${PREFIX}-gameEntry`,
    gamesCriteria: `${PREFIX}-gamesCriteria`,
    loaderRef: `${PREFIX}-loaderRef`
};

const StyledGamesGallery = styled('div')((
    {
        theme
    }
) => ({
    // inspired by the settings https://www.youtube.com/gaming uses ;)
    [`& .${classes.gameEntry}`]: {
        // 2 items on [0, sm]
        [theme.breakpoints.only('xs')]: {
            flexBasis: "calc((100% / 2) - 1%)"
        },
        // 4 items on [sm, md[
        [theme.breakpoints.only('sm')]: {
            flexBasis: "calc((100% / 4) - 1%)"
        },
        // 8 items on [md, infinity]
        [theme.breakpoints.up('md')]: {
            flexBasis: "calc((100% / 8) - 1%)"
        },
    },
    [`& .${classes.gamesCriteria}`]: {
        display: "flex",
        [theme.breakpoints.down('md')]: {
            flexDirection: "column",
            rowGap: "8px"
        },
        [theme.breakpoints.up('md')]: {
            flexDirection: "row",
            justifyContent: "flex-end"
        }
    },
    [`& .${classes.loaderRef}`]: {
        width: "1px",
        height: "1px",
        position: "absolute"
    }
}));

// The gallery component
function GamesGalleryGrid(_props) {

    const { t } = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();

    const loading = useSelector((state: RootState) => state.games.loading);
    const error = useSelector((state: RootState) => state.games.error);
    const games = useSelector((state: RootState) => state.games.games);
    const currentItemCount = useSelector((state: RootState) => state.games.currentItemCount);
    const totalItems = useSelector((state: RootState) => state.games.totalItems);
    const activeFilters = useSelector((state: RootState) => state.games.activeFilters);
    const sorters = useSelector((state: RootState) => state.games.sorters);
    const initialLoad = useSelector((state: RootState) => state.games.initialLoad);
    const scrollLoading = useSelector((state: RootState) => state.games.scrollLoading);

    const canLoadMore = (currentItemCount <= totalItems);

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchGames({currentFilters: activeFilters, sortStates: sorters}))
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [games]
    );

    // render row
    const renderRow = (game) =>
        <Grid 
            key={game.playlistId ?? game.videoId} 
            item 
            className={classes.gameEntry}
        >
            <CardEntry game={game}/>
    </Grid>;

    const loadMoreGames = useCallback( () => {
        dispatch(scrollingFetching());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [scrollLoading, canLoadMore]
    );

    const { loaderRef } = useInfiniteLoader({
        loadMore: loadMoreGames,

        // If this is false useInfiniteLoader no longer invokes `loadMore` when it usually does
        canLoadMore,

        // Used for if your data fetching library fetches page 0 and renders it when the component loads, 
        // to use this just have a state flag that you set to false once the initial load from 
        // your data fetching lib has happened.
        // default : true
        initialise: !initialLoad,

        // Passed directly to the intersection observer https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Intersection_observer_options
        // Default : "100px 0px 0px 0px"
        //rootMargin: "0px 0px 0px 0px",

        // Passed directly to the intersection observer https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Intersection_observer_options
        threshold: 1,

        // Prints some helpful messages about what useInfiniteLoader is doing.
        debug: false,
    });

    const currentSortFunction = generate_sort_function(sorters);
    const filtersFunction = generate_filter_function(activeFilters);

    const currentGames = games
        // remove the ones that doesn't match filter criteria
        .filter(filtersFunction)
        // sort them in user preference
        .sort(currentSortFunction)
        // 
        .slice(0, currentItemCount);

    return (
        <ReloadWrapper 
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchGames({currentFilters: activeFilters, sortStates: sorters}))}}
            component={
                <StyledGamesGallery>
                    <Grid
                        container
                        className={classes.gamesCriteria}
                    >
                        <Grid item xs={12} md={1}>
                            <GamesSorters />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <PlatformSelect variant="standard" />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <GenresSelect variant="standard" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TitleFilter />
                        </Grid>
                    </Grid>

                    <Grid
                        container
                        spacing={1}
                        style={
                            {
                                rowGap: "15px"
                            }
                        }
                    >
                        {
                            currentGames
                                // render row
                                .map(renderRow)
                        }
                    </Grid>
                    <div ref={loaderRef as any} className={classes.loaderRef} />
                    {scrollLoading && <Alert severity="info">{t("common.loading")}</Alert>}
                    {!canLoadMore && <Alert severity="info">{t("common.noResults")}</Alert>}
                </StyledGamesGallery>
            }
        />
    );
}

export default GamesGalleryGrid;