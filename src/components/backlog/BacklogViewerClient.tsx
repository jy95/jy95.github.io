"use client";

// Hooks
import { useMemo } from 'react';

// Redux
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";
import { useGetGlobalStatsQuery } from "@/redux/services/votesAPI";

// Components
import generateColumns from "./tableColumns";
import { GameDataGrid } from '@/components/common/GameDataGrid';
import QueryErrorState from '@/components/common/QueryErrorState';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';

// Types
import type { Props as PropsTable } from "./tableColumns";
type Props = {} & PropsTable;

export default function BacklogViewerClient(props: Props) {
    return (
        <SuspenseBoundary>
            <BacklogViewerClientInner {...props} />
        </SuspenseBoundary>
    );
}

function BacklogViewerClientInner(props: Props) {

    // Using a query hook automatically fetches data and returns query values
    const { data : backlogData, error, isLoading, refetch } = useGetBacklogQuery();
    const { data : stats } = useGetGlobalStatsQuery();

    const data = useMemo(
        () => backlogData?.map(entry => ({ ...entry, votes: stats?.[entry.id] ?? 0 })) ?? [],
        [backlogData, stats]
    );

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }

    const columns = generateColumns(props);

    return (
        <>
            <GameDataGrid 
                columns={columns}
                rows={data}
                loading={isLoading}
                sortModel={[{ field: 'title', sort: 'asc' }]}
                columnVisibilityModel={{ notes: false }}
                showVoteSection={true}
            />
        </>
    );
}