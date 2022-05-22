import React from 'react';

// icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SvgIcon from '@mui/material/SvgIcon';

// Others
import Tooltip from '@mui/material/Tooltip';

// Platform icons
import iconsSVG from "../GamesView/PlatformIcons";

// columns definitions
const planningColumns = (t, date_options, language) => [
    {
        field: "title", 
        headerName: t("planning.columns.title"),
        headerAlign: 'center',
        renderCell: (params) => (
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
        //headerAlign: 'center',
        //align: 'center',
        renderCell: (params) => (
            <SvgIcon titleAccess={params.value}>
                <path d={iconsSVG[params.value]} />
            </SvgIcon>
        ),
        width: 160
    },
    {
        field: "releaseDate", 
        headerName: t("planning.columns.releaseDate"),
        headerAlign: 'center',
        renderCell: (params) => (
            <>
                {params.value.toLocaleDateString(language, date_options)}
            </>
        ),
        width: 220
    },
    {
        field: "endDate", 
        headerName: t("planning.columns.endDate"),
        headerAlign: 'center',
        renderCell: (params) => (
            <>
                {params.value.toLocaleDateString(language, date_options)}
            </>
        ),
        width: 220,
        hide: true
    },
    {
        field: "status",
        headerName: t("planning.columns.status"),
        //headerAlign: 'center',
        renderCell: (params) => (
            <Tooltip title={t("planning.states." + params.value )} aria-label={params.value}>
                {
                    (() => {
                        switch(params.value) {
                            case "RECORDED":
                                return <CheckCircleIcon />;
                            case "PENDING":
                                return <HourglassEmptyIcon />;
                            default:
                                return null;
                        }
                    })()
                }   
            </Tooltip>
        ),
        width: 130
    }
];

export default planningColumns;