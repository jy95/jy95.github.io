// Material UI
import Tooltip from '@mui/material/Tooltip';

// Others
import PlatformColumn from "@/components/tableColumns/platforms";
import { renderTooltipCell } from "@/components/tableColumns/renderTooltipCell";
import { timeToSeconds } from "@/domain/games";

// Types
import type { GridColDef } from '@mui/x-data-grid';

export type Props = {
    titleLabel: string,
    platformLabel: string,
    notesLabel: string,
    hltbLabel: string,
    votesLabel: string
}

export default function tableColumns(props: Props) : GridColDef[]{
    return [
        {
            field: "title",
            headerName: props.titleLabel,
            headerAlign: 'center',
            renderCell: renderTooltipCell,
            width: 270
          },
          {
            field: "platform",
            headerName: props.platformLabel,
            ...PlatformColumn
          },
          {
            field: "votes",
            headerName: props.votesLabel,
            headerAlign: 'center',
            width: 90,
            type: 'number'
          },
          {
            field: "notes",
            headerName: props.notesLabel,
            headerAlign: 'center',
            renderCell: renderTooltipCell,
            width: 270
          },
          {
            field: "hltb_main",
            headerName: props.hltbLabel,
            headerAlign: 'center',
            filterable: false,
            valueGetter: (value: string | undefined) => {
              if (!value) return 0;
              return timeToSeconds(value);
            },
            valueFormatter : (value: number | undefined) => {
              if (!value || value <= 0) return "-";
                  
              const hours = Math.floor(value / 3600);
              const minutes = Math.floor((value % 3600) / 60);

              // If less than an hour, just show minutes
              if (hours === 0) return `${minutes}m`;
                  
              // If an hour or more, show hours and optional minutes
              return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
            },
            width: 270
          }
    ];
}