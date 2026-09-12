import { renderTooltipCell } from "./renderTooltipCell";
import type { GridColDef } from "@mui/x-data-grid";

export function titleColumn(headerName: string): GridColDef {
    return { 
        field: "title", 
        headerName, 
        headerAlign: "center", 
        renderCell: renderTooltipCell, 
        width: 270 
    };
}