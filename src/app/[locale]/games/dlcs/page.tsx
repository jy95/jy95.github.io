"use client";

import { useGetDLCsQuery } from "@/redux/services/dlcsAPI";
import { QueryBoundary } from '@/components/common/QueryBoundary';
import SkeletonGrid from '@/components/common/SkeletonGrid';
import { GroupedGamesAccordion } from '@/features/games/components/GroupedGamesAccordion';

export default function GamesGalleryList() {
    const { data, error, isLoading, refetch } = useGetDLCsQuery();

    return (
        <QueryBoundary
            error={error}
            isLoading={isLoading}
            data={data}
            onRetry={refetch}
            loadingFallback={<SkeletonGrid />}
        >
            {(groups) => (
                <GroupedGamesAccordion category="dlcs" groups={groups} itemSize={{
                    xs: 6,
                    md: 4,
                    lg: 1.5
                }} />
            )}
        </QueryBoundary>
    );
}
