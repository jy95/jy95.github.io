"use client";

// Hooks
import { useTranslations } from 'next-intl';
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';

// Redux
import { useGetBacklogQuery } from "@/redux/services/backlogAPI";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

// Others
import Tooltip from '@mui/material/Tooltip';
import PlatformColumn from "@/components/tableColumns/platforms";

export default function BacklogViewer() {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading } = useGetBacklogQuery();
    const customLocaleText = useMuiXDataGridText();
    const t = useTranslations("backlog");

    if (error) {
        return <>Something bad happened</>
    }

    const columns : GridColDef[] = [
        {
            field: "title",
            headerName: t("columns.title"),
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
            headerName: t("columns.platform"),
            ...PlatformColumn
          },
          {
            field: "notes",
            headerName: t("columns.notes"),
            headerAlign: 'center',
            renderCell: ({ value }) => (
              <Tooltip title={value || ""} aria-label={value || ""}>
                {value || ""}
              </Tooltip>
            ),
            width: 270
          },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DataGrid 
              rows={data} 
              columns={columns} 
              disableRowSelectionOnClick 
              localeText={customLocaleText}
              slots={{
                  toolbar: GridToolbar
              }}
              slotProps={{
                  loadingOverlay: {
                      variant: 'linear-progress',
                      noRowsVariant: 'skeleton',
                  }
              }}
              loading={isLoading}
              sortingOrder={['asc', 'desc']}
              initialState={{
                  sorting: {
                      sortModel: [{ field: 'title', sort: 'asc' }],
                  },
                  columns: {
                      columnVisibilityModel: {
                          // Hide columns notes, the other columns will remain visible
                          notes: false
                      }
                  }
              }}
          />
        </div>
    )

}