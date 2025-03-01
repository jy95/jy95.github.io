"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';

// Redux
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";

// Components
import { DataGrid } from '@mui/x-data-grid';
import generateColumns from "./tableColumns";

// Types
import type { Props as PropsTable } from "./tableColumns";
type Props = {} & PropsTable;

export default function BacklogViewerClient(props : Props) {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetBacklogQuery();
    const customLocaleText = useMuiXDataGridText();

    if (error) {
        return <>Something bad happened</>
    }

    const columns = generateColumns(props);

    return (
        <DataGrid 
            showToolbar
            rows={data} 
            columns={columns} 
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
    );
}