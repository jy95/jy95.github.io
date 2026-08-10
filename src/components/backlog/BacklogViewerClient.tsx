"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';
import { useMemo, useState } from 'react';

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
    const customLocaleText = useMuiXDataGridText();
    const { data : stats } = useGetGlobalStatsQuery();
    const [selectedGame, setSelectedGame] = useState<BacklogEntry | null>(null);

    // NOTE: this must run unconditionally, before the `error` early return
    // below — hooks can't be called conditionally. The previous version
    // called useMemo *after* the early return, which happened to work only
    // while `error` stayed falsy; it throws "Rendered fewer hooks than
    // expected" the moment a query that previously succeeded fails on a
    // refetch.
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
            <DataGrid 
                showToolbar
                rows={data} 
                columns={columns} 
                onRowClick={handleRowClick}
                disableRowSelectionOnClick 
                localeText={customLocaleText}
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
            {selectedGame && <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} />}
        </>
    );
}