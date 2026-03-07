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
    hltbLabel: string
}

// Convert a time string in the format "HH:MM:SS" to total seconds
const timeToSeconds = (timeStr: string | undefined): number => {
  if (!timeStr) return 0;
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

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
          {
            field: "hltb_main",
            headerName: props.hltbLabel,
            headerAlign: 'center',
            filterable: false,
            valueGetter: ({ value }: { value: string | undefined }) => {
              if (!value) return 0;
              return timeToSeconds(value);
            },
            valueFormatter : ({ value }: { value: number | undefined }) => {
                if (!value) return "";
                const hours = Math.floor(value / 3600);
                const minutes = Math.floor((value % 3600) / 60);
                const seconds = value % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            },
          }
    ];
}