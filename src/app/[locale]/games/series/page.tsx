"use client";

// Hooks
import { useGetSeriesQuery } from "@/redux/services/seriesAPI";

// Components
import QueryErrorState from '@/components/common/QueryErrorState';
import SkeletonGrid from '@/components/common/SkeletonGrid';
import { GroupedGamesAccordion } from '@/features/games/components/GroupedGamesAccordion';

// The gallery component
function GamesGalleryList() {

    const { data, error, isLoading, refetch } = useGetSeriesQuery();

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }
    
    if (isLoading) {
        return <SkeletonGrid count={5} height={50} />;
    }

    if (!data) {
        return null;
    }

    return (
        <>
            <GroupedGamesAccordion groups={data} itemSize={{
                xs: 6,
                md: 4,
                lg: 1.5
            }} />
        </>
    )
}


export default GamesGalleryList;