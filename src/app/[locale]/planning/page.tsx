"use client";

// Hooks
import { useTranslations } from 'next-intl';
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// columns
import generateColumns from "@/components/planning/tableColumns";

export default function PlanningViewer() {

    // Using a query hook automatically fetches data and returns query values

    const { data, error, isLoading } = useGetPlanningQuery();
    const customLocaleText = useMuiXDataGridText();
    const t = useTranslations("planning");

    if (error) {
        return <>Something bad happened</>
    }
    
    const columns = generateColumns({
        endDateLabel: t("columns.endDate"),
        platformLabel: t("columns.platform"),
        releaseDateLabel: t("columns.releaseDate"),
        statusLabel: t("columns.status"),
        titleLabel: t("columns.title"),
        statesLabels: {
            PENDING: t("states.PENDING"),
            RECORDED: t("states.RECORDED")
        }
    });

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
                        sortModel: [{ field: 'releaseDate', sort: 'asc' }],
                    },
                    columns: {
                        columnVisibilityModel: {
                            // Hide columns endDate, the other columns will remain visible
                            endDate: false
                        }
                    }
                }}
            />
        </div>
    )
}