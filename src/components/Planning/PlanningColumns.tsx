// icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SvgIcon from '@mui/material/SvgIcon';
import type { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

// Others
import Tooltip from '@mui/material/Tooltip';

// Platform icons
// @ts-ignore
import iconsSVG from "../GamesView/PlatformIcons.tsx";

const renderNumberAsDate = (language : string, date_options) => (params : GridRenderCellParams<string | undefined>) => <>
    { (params.value) ? new Date(params.value).toLocaleDateString(language, date_options) : null }
</>

// columns definitions
const planningColumns = (t : (key: string, ...rest : any) => string, date_options, language : string) => [
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
        width: 270,
        // Needed so that Material ui doesn't try to import their stuff
        renderEditCell: (_params) => <></>
    },
    {
        field: "platform",
        headerName: t("planning.columns.platform"),
        //headerAlign: 'center',
        //align: 'center',
        renderCell: (params : GridRenderCellParams) => (
            <SvgIcon titleAccess={params.value}>
                {iconsSVG[params.value]}
            </SvgIcon>
        ),
        width: 160,
        // Needed so that Material ui doesn't try to import their stuff
        renderEditCell: (_params) => <></>
    },
    {
        field: "releaseDate", 
        headerName: t("planning.columns.releaseDate"),
        headerAlign: 'center',
        renderCell: renderNumberAsDate(language, date_options),
        width: 220,
        // Needed so that Material ui doesn't try to import their stuff
        renderEditCell: (_params) => <></>
    },
    {
        field: "endDate", 
        headerName: t("planning.columns.endDate"),
        headerAlign: 'center',
        renderCell: renderNumberAsDate(language, date_options),
        width: 220,
        hide: true,
        // Needed so that Material ui doesn't try to import their stuff
        renderEditCell: (_params) => <></>
    },
    {
        field: "status",
        headerName: t("planning.columns.status"),
        //headerAlign: 'center',
        renderCell: (params : GridRenderCellParams) => (
            <Tooltip title={t("planning.states." + params.value )} aria-label={params.value}>
                { 
                    (params.value === "RECORDED") ? <CheckCircleIcon /> : <HourglassEmptyIcon />
                }
            </Tooltip>
        ),
        width: 130,
        // Needed so that Material ui doesn't try to import their stuff
        renderEditCell: (_params) => <></>
    }
] as GridColDef[];

export default planningColumns;