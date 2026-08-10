"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';
import { useMemo, useState, Suspense } from 'react';

// Redux
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";
import { useGetGlobalStatsQuery } from "@/redux/services/votesAPI";

// Components
import { DataGrid } from '@mui/x-data-grid';
import generateColumns from "./tableColumns";
import GameDetailView from '../GameDetailView/GameDetailView';
import QueryErrorState from '@/components/common/QueryErrorState';

// Types
import type { Props as PropsTable } from "./tableColumns";
import type { GridEventListener } from '@mui/x-data-grid';
import type { BacklogEntry } from "@/app/api/backlog/route";
type Props = {} & PropsTable;

export default function BacklogViewerClient(props : Props) {

    // Using a query hook automatically fetches data and returns query values
    const { data : backlogData, error, isLoading, refetch } = useGetBacklogQuery();
    const { data : stats } = useGetGlobalStatsQuery();
    const [selectedGame, setSelectedGame] = useState<BacklogEntry | null>(null);

    // NOTE: this must run unconditionally, before the `error` early return
    const data = useMemo(
        () => backlogData?.map(entry => ({ ...entry, votes: stats?.[entry.id] ?? 0 })) ?? [],
        [backlogData, stats]
    );

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }

    const columns = generateColumns(props);

    const handleRowClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedGame(params.row as BacklogEntry);
    }

    return (
        <>
            <Suspense fallback={null}>
                <BacklogDataGrid
                    data={data}
                    columns={columns}
                    onRowClick={handleRowClick}
                    isLoading={isLoading}
                />
            </Suspense>

            {selectedGame && <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />}
        </>
    );
}

function BacklogDataGrid({ data, columns, onRowClick, isLoading }: {
    data: any[];
    columns: any[];
    onRowClick: GridEventListener<'rowClick'>;
    isLoading: boolean;
}) {
    const localeText = useMuiXDataGridText();

    return (
        <DataGrid
            showToolbar
            rows={data}
            columns={columns}
            onRowClick={onRowClick}
            disableRowSelectionOnClick
            localeText={localeText}
            slotProps={{
                loadingOverlay: {
                    variant: 'linear-progress',
                    noRowsVariant: 'skeleton',
                }
            }}
            loading={isLoading}
            sortingOrder={['asc', 'desc']}
            initialState={{
                sorting: {
                    sortModel: [{ field: 'title', sort: 'asc' }],
                },
                columns: {
                    columnVisibilityModel: {
                        // Hide columns notes, the other columns will remain visible
                        notes: false
                    }
                }
            }}
        />
    );
}
