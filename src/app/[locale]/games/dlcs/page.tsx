"use client";

// Hooks
import { useGetDLCsQuery } from "@/redux/services/dlcsAPI";

// Components
import QueryErrorState from '@/components/common/QueryErrorState';
import SkeletonGrid from '@/components/common/SkeletonGrid';
import { GroupedGamesAccordion } from '@/features/games/components/GroupedGamesAccordion';

// The gallery component
function GamesGalleryList() {

    const { data, error, isLoading, refetch } = useGetDLCsQuery();

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }

    if (isLoading) {
        return <SkeletonGrid />;
    }

    if (!data) {
        return null;
    }

    return (
        <GroupedGamesAccordion groups={data} itemSize={{
            xs: 6,
            md: 4,
            lg: 1.5
        }} />
    )
}

export default GamesGalleryList;