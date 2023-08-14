"use client";

// Hooks
import { useState } from 'react';
import { useGetGamesQuery } from "@/redux/services/gamesAPI";

import { useAppSelector } from "@/redux/hooks";

// Style
import Grid from "@mui/material/Grid";
import Skeleton from '@mui/material/Skeleton';
import LoadingButton from '@mui/lab/LoadingButton';

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import GamesFilters from "./GamesFilters";

// Types
import type { EnhancedGame } from "@/redux/sharedDefintion";
import { gamesSorters, gamesFilters } from '@/redux/features/gamesSlice';

// <Skeleton variant="rectangular" width={169} height={169} />

// To force reset of page when filters / sorters criteria changes
type InnerProps = {
    activeFilters: gamesFilters,
    activeSorters: gamesSorters,
}

// To help react detect change in filters / sorters
function generateKey({activeFilters, activeSorters} : InnerProps) : string {
    return Object
        .entries({
            activeFilters,
            activeSorters
        })
        .toString();
}

export default function GamesGalleryGrid() {

    // Active filters
    const activeFilters = useAppSelector(
        (state) => state.games.activeFilters
    );

    // Active sorters
    const activeSorters = useAppSelector(
        (state) => state.games.sorters
    );


    return (
        <div>
            <GamesFilters />
            <GamesGalleryGridInner 
                activeFilters={activeFilters}
                activeSorters={activeSorters}
                key={generateKey({activeFilters, activeSorters})}
            />
        </div>
    )
}

// To force reset of page when filters / sorters criteria changes
function GamesGalleryGridInner({ activeFilters, activeSorters } : InnerProps) {

    // Current page
    const [page, setPage] = useState(1);

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
        <>
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
                    disabled={ page >= (data?.total_pages || 1) }
                    onClick={() => {
                        // Reminder : https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
                        setPage( (prev) => prev + 1 );
                    }}
                    variant="outlined"
                >
                    <span>Load more</span>
                </LoadingButton>
            </div> 
        </>
    )
}