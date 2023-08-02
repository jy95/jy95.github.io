"use client";

// Hooks
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation'

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SvgIcon from '@mui/material/SvgIcon';

// Platform icons
import iconsSVG from "@/components/GamesView/PlatformIcons";
import type { Platform } from '@/redux/services/sharedDefintion';

// Others
import Tooltip from '@mui/material/Tooltip';

// Redux
import { fetchPlanning, selectPlanning } from "@/redux/services/planningSlice";

// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useAsyncMemo } from '@/hooks/useAsyncMemo';

function Viewer() {

    const dispatch = useAppDispatch();
    const { planning : data } = useAppSelector((state) => selectPlanning(state));
    const { t, lang } = useTranslation('common');

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchPlanning());
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )
    
    const columns : GridColDef[] = [
        {
            field: "title", 
            headerName: t("planning.columns.title"),
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
            headerName: t("planning.columns.platform"),
            renderCell: (params : GridRenderCellParams) => (
                <SvgIcon titleAccess={params.value}>
                    {iconsSVG[params.value as Platform]}
                </SvgIcon>
            ),
            width: 160
        },
        {
            field: "releaseDate", 
            headerName: t("planning.columns.releaseDate"),
            headerAlign: 'center',
            type: 'date',
            valueGetter: (params) => (params.value) ? new Date(params.value) : null,
            width: 220
        },
        {
            field: "endDate", 
            headerName: t("planning.columns.endDate"),
            headerAlign: 'center',
            type: 'date',
            valueGetter: (params) => (params.value) ? new Date(params.value) : null,
            width: 220
        },
        {
            field: "status",
            headerName: t("planning.columns.status"),
            renderCell: (params : GridRenderCellParams) => (
                <Tooltip title={t(`planning.states.${params.value}` as const)} aria-label={params.value}>
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

export default Viewer;