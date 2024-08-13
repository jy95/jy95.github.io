"use client";

// Hooks
import { useTranslations } from 'next-intl';
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';

// Redux
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

// Platform icons
import RenderPlatformIcon from "@/components/GamesView/PlatformIcons";

// Others
import Tooltip from '@mui/material/Tooltip';

export default function BacklogViewer() {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetBacklogQuery();
    const customLocaleText = useMuiXDataGridText();
    const t = useTranslations("backlog");

    if (error) {
        return <>Something bad happened</>
    }

    const columns : GridColDef[] = [
        {
            field: "title", 
            headerName: t("columns.title"),
            headerAlign: 'center',
            renderCell: (params : GridRenderCellParams) => (
                <Tooltip title={params.value} aria-label={params.value}>
                    <div>
                        {params.value}
                    </div>
                </Tooltip>
            ),
            width: 270
        },
        {
            field: "platform",
            headerName: t("columns.platform"),
            renderCell: (params: GridRenderCellParams) => {
                return (<RenderPlatformIcon identifier={params.value} />)
            },
            width: 160
        },
        {
            field: "notes", 
            headerName: t("columns.notes"),
            headerAlign: 'center',
            renderCell: (params : GridRenderCellParams) => (
                <Tooltip title={params.value || ""} aria-label={params.value || ""}>
                    <div>
                        {params.value || ""}
                    </div>
                </Tooltip>
            ),
            width: 270
        },
    ];

    return (
        <div style={{ height: 450, width: '100%' }}>
            <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                    <DataGrid 
                        rows={data} 
                        columns={columns} 
                        disableRowSelectionOnClick 
                        //disableExtendRowFullWidth // No needed for now
                        disableColumnFilter // or filterable: false in each column
                        autoHeight  
                        localeText={customLocaleText}
                        slots={{
                            toolbar: GridToolbar
                        }}
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
                </div>
            </div>
        </div>
    )

}