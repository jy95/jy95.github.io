// Platform icons
import RenderPlatformIcon from "@/components/GamesView/PlatformIcons";

// Options
import PLATFORMS_OPTIONS from "@/components/filters/platformsFilters";

// Material UI
import type { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

const column : Partial<GridColDef<any, number>> = {
    type: "singleSelect",
    valueOptions: PLATFORMS_OPTIONS,
    renderCell: (params : GridRenderCellParams) => (
        <RenderPlatformIcon identifier={params.value} />
    ),
    width: 160
}

export default column;