"use client";

import { useEffect, useCallback } from "react";
import { styled } from '@mui/material/styles';

// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import useInfiniteLoader from 'react-use-infinite-loader';

// Style
import Alert from '@mui/material/Alert';
import Grid from "@mui/material/Grid";

// Custom
import CardEntry from "./CardEntry";
import GenresSelect from "./GenresSelect";
import PlatformSelect from "./PlatformSelect";
import TitleFilter from "./TitleFilter";

// Redux
import { 
    fetchGames,
    scrollingFetching,
    selectCurrentGames,
    selectCanLoadMore
}
from "@/redux/features/gamesSlice";
import type { EnhancedGame } from "@/redux/sharedDefintion";

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
function GamesGalleryGrid() {

    const t = useTranslations("common")
    const dispatch = useAppDispatch();

    // Current displayed games
    const currentGames = useAppSelector(
        (state) => selectCurrentGames(state)
    );

    // Can load more
    const canLoadMore = useAppSelector(
        (state) => selectCanLoadMore(state)
    );

    // initialLoad
    const initialLoad = useAppSelector(
        (state) => state.games.initialLoad
    )

    // scrollLoading
    const scrollLoading = useAppSelector(
        (state) => state.games.scrollLoading
    )

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchGames())
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
        <StyledGamesGallery>
            <Grid
                container
                className={classes.gamesCriteria}
            >
                <Grid item xs={12} md={3}>
                    <PlatformSelect />
                </Grid>
                <Grid item xs={12} md={5}>
                    <GenresSelect />
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
            {scrollLoading && <Alert severity="info">{t("loading")}</Alert>}
            {!canLoadMore && <Alert severity="info">{t("noResults")}</Alert>}
        </StyledGamesGallery>
    );
}

export default GamesGalleryGrid;