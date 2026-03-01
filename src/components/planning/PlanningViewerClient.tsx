"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';
import { useState } from 'react';

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Material UI
import { DataGrid } from '@mui/x-data-grid';

// Components
import GameDetailView from '@/components/GameDetailView/GameDetailView';

// columns
import generateColumns from "@/components/planning/tableColumns";

import type { Props as PropsColumns } from "@/components/planning/tableColumns";
import type { GridEventListener } from '@mui/x-data-grid';
import type { CardGame } from '@/redux/sharedDefintion';

type Props = {} & PropsColumns;

export default function PlanningViewer(props: Props) {

    // Using a query hook automatically fetches data and returns query values

    const { data, error, isLoading } = useGetPlanningQuery();
    const customLocaleText = useMuiXDataGridText();
    const [selectedGame, setSelectedGame] = useState<CardGame | null>(null);

    if (error) {
        return <>Something bad happened</>
    }
    
    const columns = generateColumns(props);

    const handleRowClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedGame(params.row as CardGame);
    };

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
                        sortModel: [{ field: 'availableAt', sort: 'asc' }],
                    },
                    columns: {
                        columnVisibilityModel: {
                            // Hide columns endAt, the other columns will remain visible
                            endAt: false
                        }
                    }
                }}
            />
            {selectedGame && (
                <GameDetailView 
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </>
    )
}