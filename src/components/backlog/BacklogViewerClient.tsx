"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';
import { useState } from 'react';

// Redux
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";

// Components
import { DataGrid } from '@mui/x-data-grid';
import generateColumns from "./tableColumns";
import GameDetailView from '../GameDetailView/GameDetailView';

// Types
import type { Props as PropsTable } from "./tableColumns";
import type { GridEventListener } from '@mui/x-data-grid';
import type { BacklogEntry } from "@/app/api/backlog/route";
type Props = {} & PropsTable;

export default function BacklogViewerClient(props : Props) {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetBacklogQuery();
    const customLocaleText = useMuiXDataGridText();
    const [selectedGame, setSelectedGame] = useState<BacklogEntry | null>(null);

    if (error) {
        return <>Something bad happened</>
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