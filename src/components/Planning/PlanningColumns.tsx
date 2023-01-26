// icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SvgIcon from '@mui/material/SvgIcon';
import type { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

// Others
import Tooltip from '@mui/material/Tooltip';

// Platform icons
import iconsSVG from "../GamesView/PlatformIcons";
import type { Platform } from '../../services/sharedDefintion';

// columns definitions
const planningColumns = (t : (key: string, ...rest : any) => string, date_options : any, language : string) => [
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
        width: 220,
        hide: true
    },
    {
        field: "status",
        headerName: t("planning.columns.status"),
        renderCell: (params : GridRenderCellParams) => (
            <Tooltip title={t("planning.states." + params.value )} aria-label={params.value}>
                { 
                    (params.value === "RECORDED") ? <CheckCircleIcon /> : <HourglassEmptyIcon />
                }
            </Tooltip>
        ),
        width: 130
    }
] as GridColDef[];

export default planningColumns;