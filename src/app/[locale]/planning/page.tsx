"use client";

// Hooks
import {useTranslations , useLocale} from 'next-intl';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SvgIcon from '@mui/material/SvgIcon';

// Platform icons
import iconsSVG from "@/components/GamesView/PlatformIcons";
import type { Platform } from '@/redux/sharedDefintion';

// Others
import Tooltip from '@mui/material/Tooltip';

type GameStatus = "RECORDED" | "PENDING";

export default function PlanningViewer() {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetPlanningQuery();
    const lang = useLocale();
    const t = useTranslations("planning");

    if (error) {
        return <>Something bad happened</>
    }

    if (isLoading) {
        return <>Loading</>
    }

    if (!data) {
        return null;
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
            renderCell: (params : GridRenderCellParams) => (
                <SvgIcon titleAccess={params.value}>
                    {iconsSVG[params.value as Platform]}
                </SvgIcon>
            ),
            width: 160
        },
        {
            field: "releaseDate", 
            headerName: t("columns.releaseDate"),
            headerAlign: 'center',
            type: 'date',
            valueGetter: (params) => (params.value) ? new Date(params.value) : null,
            width: 220
        },
        {
            field: "endDate", 
            headerName: t("columns.endDate"),
            headerAlign: 'center',
            type: 'date',
            valueGetter: (params) => (params.value) ? new Date(params.value) : null,
            width: 220
        },
        {
            field: "status",
            headerName: t("columns.status"),
            renderCell: (params : GridRenderCellParams) => (
                <Tooltip title={t(`states.${params.value as GameStatus}`as const)} aria-label={params.value}>
                    { 
                        (params.value === "RECORDED") ? <CheckCircleIcon /> : <HourglassEmptyIcon />
                    }
                </Tooltip>
            ),
            width: 130
        }
    ];

    const customLocaleText = useAsyncMemo(async () => {
        switch(lang) {
            case 'fr':
                const { 
                    frFR : {
                        components : {
                            MuiDataGrid : {
                                defaultProps : {
                                    localeText
                                }
                            }
                        }
                    }
                } = await import("@mui/x-data-grid");
                return localeText;
            // English is by default built-in in @mui package, so no need to include
            default:
                return {};
        }
    }, [lang], {} as any);

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
                    </div>
                </div>
            </div>
        )
}