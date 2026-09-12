"use client";

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Others
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import PlatformColumn from "@/components/tableColumns/platforms";
import { titleColumn } from "@/components/tableColumns/titleColumn";

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
        titleColumn(props.titleLabel),
        {
            field: "platform",
            headerName: props.platformLabel,
            ...PlatformColumn
        },
        {
            field: "availableAt", 
            headerName: props.releaseDateLabel,
            headerAlign: 'center',
            type: 'date',
            valueGetter: (value) => value && new Date(value),
            width: 220
        },
        {
            field: "endAt", 
            headerName: props.endDateLabel,
            headerAlign: 'center',
            type: 'date',
            valueGetter: (value) => value && new Date(value),
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