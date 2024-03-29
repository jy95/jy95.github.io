"use client";

// Hooks
import { useState } from 'react';
import { useGetGamesQuery } from "@/redux/services/gamesAPI";
import { useAppSelector } from "@/redux/hooks";
import {useTranslations} from 'next-intl';

// Style
import Grid from "@mui/material/Grid";
import LoadingButton from './LoadingButton';

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import GamesFilters from "./GamesFilters";

// Types
import type { EnhancedGame } from "@/redux/sharedDefintion";
import { gamesSorters, gamesFilters } from '@/redux/features/gamesSlice';

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

    //
    const t = useTranslations('common');

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
                >
                    <span>{t('loadMore')}</span>
                </LoadingButton>
            </div> 
        </>
    )
}