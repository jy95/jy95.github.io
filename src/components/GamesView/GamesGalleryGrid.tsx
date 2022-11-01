import { useEffect, useCallback } from "react";
import { styled } from '@mui/material/styles';
import { shallowEqual } from 'react-redux';
import useInfiniteLoader from 'react-use-infinite-loader';
import { useTranslation } from "react-i18next";
import Alert from '@mui/material/Alert';

// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

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
    selectCurrentGames
}
from "../../services/gamesSlice";
import type { EnhancedGame } from "../../services/sharedDefintion";

const PREFIX = 'GamesGalleryGrid';

const classes = {
    gamesCriteria: `${PREFIX}-gamesCriteria`,
    loaderRef: `${PREFIX}-loaderRef`
};

const StyledGamesGallery = styled('div')((
    {
        theme
    }
) => ({
    // inspired by the settings https://www.youtube.com/gaming uses ;)
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
    const dispatch = useAppDispatch();

    // Current displayed games
    const currentGames = useAppSelector(
        (state) => selectCurrentGames(state)
    );

    const {
        loading,
        error,
        currentItemCount,
        totalItems,
        activeFilters,
        sorters,
        initialLoad,
        scrollLoading
    } = useAppSelector((state) => state.games, shallowEqual);

    const canLoadMore = (currentItemCount <= totalItems);

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchGames({currentFilters: activeFilters, sortStates: sorters}))
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
        []
    );

    // render row
    const renderRow = (game : EnhancedGame) =>
        <Grid 
            key={game.id}
            item
            xs={6}
            md={4}
            lg={1.5}
        >
            <CardEntry game={game}/>
    </Grid>;

    const loadMoreGames = useCallback( () => {
        dispatch(scrollingFetching());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
        []
    );

    const { loaderRef } = useInfiniteLoader({
        loadMore: loadMoreGames,
        canLoadMore,
        initialise: !initialLoad,
        debug: false,
    });

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