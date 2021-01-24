import React from 'react';

// icons
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import SvgIcon from '@material-ui/core/SvgIcon';

// Others
import Tooltip from '@material-ui/core/Tooltip';

// Platform icons
import iconsSVG from "../GamesView/PlatformIcons";

// columns definitions
export default (t, date_options) => [
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
        width: 130
    },
    {
        field: "releaseDate", 
        headerName: t("planning.columns.releaseDate"),
        headerAlign: 'center',
        renderCell: (params) => (
            <>
                {params.value.toLocaleDateString(undefined, date_options)}
            </>
        ),
        width: 200
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
        )
    }
];