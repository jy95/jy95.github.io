"use client";

// Hooks
import { useGetGamesInfiniteQuery } from "@/redux/services/gamesAPI";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from 'next-intl';

// Style
import Grid from '@mui/material/Grid';
import LoadingButton from './_client/LoadingButton';

// Custom
import { CardGrid } from "@/features/games/components/CardGrid";
import GamesFilters from "./_client/GamesFilters";
import QueryErrorState from "@/components/common/QueryErrorState";

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
        isFetching,
        isError,
        refetch
    } = useGetGamesInfiniteQuery(
        {
            filters: activeFilters,
            pageSize : LIMIT_PAGE
        }
    );

    if (isError && !data) {
        return <QueryErrorState onRetry={refetch} />;
    }

    const handleNextPage = async () => {
        await fetchNextPage()
    }

    const allGames = data?.pages.flatMap(result => result.items) ?? [];

    return (
        <>
            <CardGrid items={allGames} size={{ xs: 6, md: 4, lg: 2 }} />
            <Grid 
                container 
                sx={{ justifyContent: 'center' }}
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
