import { useEffect, useCallback } from "react";
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import useInfiniteLoader from 'react-use-infinite-loader';
import { useTranslation } from "react-i18next";
import Alert from '@mui/material/Alert';

// Style
import Grid from "@mui/material/Grid";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";
import CardEntry from "./CardEntry";
import GamesSorters from "./GamesSorters";
import GenresSelect from "./GenresSelect";
import PlatformSelect from "./PlatformSelect";
import TitleFilter from "./TitleFilter";

// Redux
import { 
    fetchGames,
    scrollingFetching,
    generate_sort_function,
    generate_filter_function,
}
from "../../services/gamesSlice";
import type { RootState, AppDispatch } from '../Store';
import type { EnhancedGame } from "../../services/sharedDefintion";

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
function GamesGalleryGrid(_props : {[key: string | number | symbol] : any}) {

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
    const renderRow = (game : EnhancedGame) =>
        <Grid 
            key={game.id}
            item 
            className={classes.gameEntry}
        >
            <CardEntry game={game}/>
    </Grid>;

    const loadMoreGames = useCallback( () => {
        dispatch(scrollingFetching());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentItemCount, totalItems]
    );

    const { loaderRef } = useInfiniteLoader({
        loadMore: loadMoreGames,
        canLoadMore,
        initialise: !initialLoad,
        debug: false,
    });

    const currentSortFunction = generate_sort_function(sorters);
    const filtersFunction = generate_filter_function(activeFilters);

    const currentGames = games
        // remove the ones that doesn't match filter criteria
        .filter(filtersFunction)
        // sort them in user preference
        .sort(currentSortFunction)
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
                    {!initialLoad && <div ref={loaderRef as any} className={classes.loaderRef} />}
                    {scrollLoading && <Alert severity="info">{t("common.loading")}</Alert>}
                    {!canLoadMore && <Alert severity="info">{t("common.noResults")}</Alert>}
                </StyledGamesGallery>
            }
        />
    );
}

export default GamesGalleryGrid;