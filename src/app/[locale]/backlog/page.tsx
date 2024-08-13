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
import iconsSVG from "@/components/GamesView/PlatformIcons";

// Icons
import SvgIcon from '@mui/material/SvgIcon';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Others
import Tooltip from '@mui/material/Tooltip';

type NumericRange<
    START extends number,
    END extends number,
    ARR extends unknown[] = [],
    ACC extends number = never
> = ARR['length'] extends END
    ? ACC | START | END
    : NumericRange<START, END, [...ARR, 1], ARR[START] extends undefined ? ACC : ACC | ARR['length']>
type Platform = NumericRange<1, 6>

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
                if (params.value !== undefined) {
                    return (
                        <SvgIcon titleAccess={params.value}>
                            {iconsSVG[params.value as Platform]}
                        </SvgIcon>
                    );
                } else {
                    return <HelpOutlineIcon />;
                }
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