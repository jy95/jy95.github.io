"use client";

// Hooks
import { useGetGamesQuery } from "@/redux/services/gamesAPI";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { nextPage } from "@/redux/features/gamesSlice";
import { useTranslations } from 'next-intl';

// Style
import Grid from '@mui/material/Grid2';
import LoadingButton from './_client/LoadingButton';

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import GamesFilters from "./_client/GamesFilters";

// Types
import type { CardGame } from "@/redux/sharedDefintion";

export default function GamesGalleryGrid() {
    return (
        <div>
            <GamesFilters />
            <GamesGalleryGridInner />
        </div>
    );
}

function GamesGalleryGridInner() {
    
    // Active filters
    const activeFilters = useAppSelector((state) => state.games.activeFilters);
    // Current page
    const page = useAppSelector((state) => state.games.page);
    const t = useTranslations('common');
    const dispatch = useAppDispatch();

    const LIMIT_PAGE = 16;

    // Lazy query setup
    const { data, isFetching } = useGetGamesQuery(
        {
            filters: activeFilters,
            pageSize : LIMIT_PAGE,
            page: page
        }
    );
    const allGames = data?.items ?? [];

    const renderRow = (game: CardGame) => (
        <Grid 
            key={game.id}
            size={{
                xs: 6,
                md: 4,
                lg: 1.5
            }}
        >
            <CardEntry game={game}/>
        </Grid>
    );

    return (
        <>
            <Grid 
                container 
                spacing={1}
                rowSpacing={1}
            >
                {allGames.map(renderRow)}
            </Grid>
            <Grid 
                container 
                justifyContent="center"
            >
                <LoadingButton
                    loading={isFetching}
                    disabled={ page >= (data?.total_pages || 1) }
                    onClick={() => dispatch(nextPage())}
                >
                    <span>{t('loadMore')}</span>
                </LoadingButton>
            </Grid>
        </>
    );
}
