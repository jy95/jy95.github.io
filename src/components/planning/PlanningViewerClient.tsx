"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Material UI
import { DataGrid } from '@mui/x-data-grid';

// columns
import generateColumns from "@/components/planning/tableColumns";

import type { Props as PropsColumns } from "@/components/planning/tableColumns";
import type { GridEventListener } from '@mui/x-data-grid';

type Props = {} & PropsColumns;

export default function PlanningViewer(props: Props) {

    // Using a query hook automatically fetches data and returns query values

    const { data, error, isLoading } = useGetPlanningQuery();
    const customLocaleText = useMuiXDataGridText();

    if (error) {
        return <>Something bad happened</>
    }
    
    const columns = generateColumns(props);

    const handleRowClick: GridEventListener<'rowClick'> = (params) => {
        console.log(params.row);
    };

    return (
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
                    sortModel: [{ field: 'releaseDate', sort: 'asc' }],
                },
                columns: {
                    columnVisibilityModel: {
                        // Hide columns endDate, the other columns will remain visible
                        endDate: false
                    }
                }
            }}
        />
    )
}