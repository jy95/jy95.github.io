"use client";

import { useGetSeriesQuery } from "@/redux/services/seriesAPI";
import { QueryBoundary } from '@/components/common/QueryBoundary';
import SkeletonGrid from '@/components/common/SkeletonGrid';
import { GroupedGamesAccordion } from '@/features/games/components/GroupedGamesAccordion';

export default function GamesGalleryList() {
    const { data, error, isLoading, refetch } = useGetSeriesQuery();

    return (
        <QueryBoundary
            error={error}
            isLoading={isLoading}
            data={data}
            onRetry={refetch}
            loadingFallback={<SkeletonGrid count={5} height={50} />}
        >
            {(groups) => (
                <GroupedGamesAccordion groups={groups} itemSize={{
                    xs: 6,
                    md: 4,
                    lg: 1.5
                }} />
            )}
        </QueryBoundary>
    );
}
