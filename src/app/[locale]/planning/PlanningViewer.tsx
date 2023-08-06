"use client";

// Hooks
import { useEffect } from 'react';

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

type GameStatus = "RECORDED" | "PENDING";

type Props = {
    // label for title column
    titleColumn: string,
    // label for platform column
    titlePlatform: string,
    // label for releaseDate column
    titleReleaseDate: string,
    // label for endDate column
    titleEndDate: string,
    // label for status column
    titleStatus: string,
    // locale
    lang: string,
    // game status
    status: {
        [key in GameStatus]: string
    }
}

export default function PlanningViewer({titleColumn, titleEndDate, titlePlatform, titleReleaseDate, titleStatus, lang, status} : Props) {

    const dispatch = useAppDispatch();
    const { planning : data } = useAppSelector((state) => selectPlanning(state));

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
            headerName: titleColumn,
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
            headerName: titlePlatform,
            renderCell: (params : GridRenderCellParams) => (
                <SvgIcon titleAccess={params.value}>
                    {iconsSVG[params.value as Platform]}
                </SvgIcon>
            ),
            width: 160
        },
        {
            field: "releaseDate", 
            headerName: titleReleaseDate,
            headerAlign: 'center',
            type: 'date',
            valueGetter: (params) => (params.value) ? new Date(params.value) : null,
            width: 220
        },
        {
            field: "endDate", 
            headerName: titleEndDate,
            headerAlign: 'center',
            type: 'date',
            valueGetter: (params) => (params.value) ? new Date(params.value) : null,
            width: 220
        },
        {
            field: "status",
            headerName: titleStatus,
            renderCell: (params : GridRenderCellParams) => (
                <Tooltip title={status[params.value as "RECORDED" | "PENDING"]} aria-label={params.value}>
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