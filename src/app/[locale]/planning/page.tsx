"use client";

// Hooks
import { useTranslations } from 'next-intl';
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Others
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import PlatformColumn from "@/components/tableColumns/platforms";

import type { JSX } from 'react'
type GameStatus = "RECORDED" | "PENDING";

export default function PlanningViewer() {

    // Using a query hook automatically fetches data and returns query values

    const { data, error, isLoading } = useGetPlanningQuery();
    const customLocaleText = useMuiXDataGridText();
    const t = useTranslations("planning");

    if (error) {
        return <>Something bad happened</>
    }
    
    const columns : GridColDef[] = [
        {
            field: "title", 
            headerName: t("columns.title"),
            headerAlign: 'center',
            renderCell: ({value}) => (
                <Tooltip title={value} aria-label={value}>
                    <div>
                        {value}
                    </div>
                </Tooltip>
            ),
            width: 270
        },
        {
            field: "platform",
            headerName: t("columns.platform"),
            ...PlatformColumn
        },
        {
            field: "releaseDate", 
            headerName: t("columns.releaseDate"),
            headerAlign: 'center',
            type: 'date',
            valueGetter: (value) => (value) ? new Date(value) : null,
            width: 220
        },
        {
            field: "endDate", 
            headerName: t("columns.endDate"),
            headerAlign: 'center',
            type: 'date',
            valueGetter: (value) => (value) ? new Date(value) : null,
            width: 220
        },
        {
            field: "status",
            headerName: t("columns.status"),
            type: "singleSelect",
            valueOptions: [
                { 
                    value: "RECORDED", 
                    label: (
                        <Box display="flex" alignItems="center">
                            <CheckCircleIcon />
                        </Box>
                    ) 
                },
                { 
                    value: 'PENDING', 
                    label: (
                        <Box display="flex" alignItems="center">
                            <HourglassEmptyIcon />
                        </Box>
                    )
                }
            ] satisfies { value: GameStatus; label: JSX.Element }[],
            renderCell: ({value}) => (
                <Tooltip title={t(`states.${value as GameStatus}`as const)} aria-label={value}>
                    { 
                        (value === "RECORDED") ? <CheckCircleIcon /> : <HourglassEmptyIcon />
                    }
                </Tooltip>
            ),
            width: 130
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataGrid 
                rows={data} 
                columns={columns} 
                disableRowSelectionOnClick 
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
    )
}