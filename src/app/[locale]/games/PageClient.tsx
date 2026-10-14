"use client";

// Hooks
import { useGetGamesInfiniteQuery } from "@/redux/services/gamesAPI";
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { useTranslations } from 'next-intl';

// Style
import Grid from '@mui/material/Grid';
import LoadingButton from './_client/LoadingButton';

// Custom
import { CardGrid } from "@/features/games/components/CardGrid";
import GamesFilters from "./_client/GamesFilters";
import QueryErrorState from "@/components/common/QueryErrorState";

export default function GamesGalleryGrid() {
    return <SuspenseBoundary><GamesGalleryGridInner /></SuspenseBoundary>;
}

function GamesGalleryGridInner() {
    const { filters, updateFilters } = useGamesFilters();
    const t = useTranslations('common');

    const LIMIT_PAGE = 12;

    const {
        hasNextPage,
        fetchNextPage,
        currentData: data,
        isFetching,
        isError,
        refetch
    } = useGetGamesInfiniteQuery(
        {
            filters,
            pageSize : LIMIT_PAGE
        }
    );
    const allGames = data?.pages.flatMap(result => result.items) ?? [];

    return (
        <>
            <GamesFilters filters={filters} onChange={updateFilters} />
            {isError && !data
                ? <QueryErrorState onRetry={refetch} />
                : <CardGrid items={allGames} size={{ xs: 6, md: 4, lg: 2 }} />}

            <Grid
                container
                sx={{ justifyContent: 'center' }}
            >
                <LoadingButton
                    loading={isFetching}
                    disabled={!hasNextPage}
                    onClick={() => fetchNextPage()}
                    label={t('loadMore')}
                />
            </Grid>
        </>
    );
}
