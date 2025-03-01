"use client";

// Hooks
import { useGetGamesInfiniteQuery } from "@/redux/services/gamesAPI";
import { useAppSelector } from "@/redux/hooks";
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
        <>
            <GamesFilters />
            <GamesGalleryGridInner />
        </>
    );
}

function GamesGalleryGridInner() {
    
    // Active filters
    const activeFilters = useAppSelector((state) => state.games.activeFilters);
    const t = useTranslations('common');

    const LIMIT_PAGE = 12;

    // Lazy query setup
    const { 
        hasNextPage,
        fetchNextPage,
        data, 
        isFetching 
    } = useGetGamesInfiniteQuery(
        {
            filters: activeFilters,
            pageSize : LIMIT_PAGE
        }
    );

    const handleNextPage = async () => {
        await fetchNextPage()
    }

    const allGames = data?.pages.map(result => result.items).flat() ?? [];

    const renderRow = (game: CardGame) => (
        <Grid 
            key={game.id}
            size={{
                xs: 6,
                md: 4,
                lg: 2
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
                    disabled={!hasNextPage}
                    onClick={handleNextPage}
                    label={t('loadMore')}
                />
            </Grid>
        </>
    );
}
