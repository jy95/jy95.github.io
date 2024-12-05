"use client";

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Others
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import PlatformColumn from "@/components/tableColumns/platforms";

// Types
import type { JSX } from "react";
import type { GridColDef } from '@mui/x-data-grid';

type GameStatus = "RECORDED" | "PENDING";

export type Props = {
    titleLabel: string,
    platformLabel: string,
    releaseDateLabel: string,
    endDateLabel: string,
    statusLabel: string,
    statesLabels: Record<GameStatus, string>
}

export default function tableColumns(props: Props) : GridColDef[]{
    return [
        {
            field: "title", 
            headerName: props.titleLabel,
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
            headerName: props.platformLabel,
            ...PlatformColumn
        },
        {
            field: "releaseDate", 
            headerName: props.releaseDateLabel,
            headerAlign: 'center',
            type: 'date',
            valueGetter: (value) => (value) ? new Date(value) : null,
            width: 220
        },
        {
            field: "endDate", 
            headerName: props.endDateLabel,
            headerAlign: 'center',
            type: 'date',
            valueGetter: (value) => (value) ? new Date(value) : null,
            width: 220
        },
        {
            field: "status",
            headerName: props.statusLabel,
            type: "singleSelect",
            valueOptions: [
                { 
                    value: "RECORDED", 
                    label: (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center"
                            }}>
                            <CheckCircleIcon />
                        </Box>
                    ) 
                },
                { 
                    value: 'PENDING', 
                    label: (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center"
                            }}>
                            <HourglassEmptyIcon />
                        </Box>
                    )
                }
            ] satisfies { value: GameStatus; label: JSX.Element }[],
            renderCell: ({value}) => (
                <Tooltip title={props.statesLabels[value as GameStatus]} aria-label={value}>
                    { 
                        (value === "RECORDED") ? <CheckCircleIcon /> : <HourglassEmptyIcon />
                    }
                </Tooltip>
            ),
            width: 130
        }
    ]
}