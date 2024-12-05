// Material UI
import Tooltip from '@mui/material/Tooltip';

// Others
import PlatformColumn from "@/components/tableColumns/platforms";

// Types
import type { GridColDef } from '@mui/x-data-grid';

export type Props = {
    titleLabel: string,
    platformLabel: string,
    notesLabel: string
}

export default function tableColumns(props: Props) : GridColDef[]{
    return [
        {
            field: "title",
            headerName: props.titleLabel,
            headerAlign: 'center',
            renderCell: ({ value }) => (
              <Tooltip title={value} aria-label={value}>
                {value}
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
            field: "notes",
            headerName: props.notesLabel,
            headerAlign: 'center',
            renderCell: ({ value }) => (
              <Tooltip title={value || ""} aria-label={value || ""}>
                {value || ""}
              </Tooltip>
            ),
            width: 270
          },
    ];
}