"use client";

// Hooks
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { useGetGamesQuery } from "@/redux/services/gamesAPI";

import { useAppSelector } from "@/redux/hooks";

// Style
import Grid from "@mui/material/Grid";
import Skeleton from '@mui/material/Skeleton';
import LoadingButton from '@mui/lab/LoadingButton';

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import GenresSelect from "@/components/GamesView/GenresSelect";
import PlatformSelect from "@/components/GamesView/PlatformSelect";
import TitleFilter from "@/components/GamesView/TitleFilter";

// Types
import type { EnhancedGame } from "@/redux/sharedDefintion";

// Custom component
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

// <Skeleton variant="rectangular" width={169} height={169} />

export default function GamesGalleryGrid() {

    // Current page
    const [page, setPage] = useState(1);

    // Active filters
    const activeFilters = useAppSelector(
        (state) => state.games.activeFilters
    );

    // Active sorters
    const activeSorters = useAppSelector(
        (state) => state.games.sorters
    );

    // Lazy load from now ; later I can reconsider it if data source changes
    const LIMIT_PAGE = 16;
    const { data, isFetching } = useGetGamesQuery({
        filters: activeFilters,
        sorters: activeSorters,
        pageSize : LIMIT_PAGE,
        page: page
    });

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

    const games = data?.items ?? [];

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
                {games.map(renderRow)}
                {/*isFetching && (
                    // Render additional skeleton loaders while fetching more data
                    Array.from({ length: LIMIT_PAGE }).map((_, index) => (
                        <Grid key={`skeleton-${index}`} item xs={12} sm={6} md={4} lg={3}>
                            <Skeleton variant="rectangular" width={169} height={169} />
                        </Grid>
                    ))
                )*/}
            </Grid>
            <div style={{
                justifyContent: "center",
                display: "flex",
                marginTop: "15px"
            }}>
                <LoadingButton
                    loading={isFetching}
                    disabled={ page === data?.total_pages }
                    onClick={() => {
                        // Reminder : https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
                        setPage( (prev) => prev + 1 );
                    }}
                    variant="outlined"
                >
                    <span>Load more</span>
                </LoadingButton>
            </div>
        </StyledGamesGallery>
    )

}