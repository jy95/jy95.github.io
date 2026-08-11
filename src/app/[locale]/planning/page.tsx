"use client";

// Hooks
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';
import { useTranslations } from "next-intl";
import { useState } from 'react';

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Material UI
import { DataGrid } from '@mui/x-data-grid';

// Components
import GameDetailView from '@/components/GameDetailView/GameDetailView';
import QueryErrorState from '@/components/common/QueryErrorState';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';

// columns
import generateColumns from "@/components/planning/tableColumns";

// Types
import type { planningEntry } from "@/app/api/planning/route";
import type { GridEventListener } from '@mui/x-data-grid';

export default function PlanningViewer() {
    return (
        <SuspenseBoundary>
            <PlanningViewerInner />
        </SuspenseBoundary>
    );
}

function PlanningViewerInner() {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading, refetch } = useGetPlanningQuery();
    const customLocaleText = useMuiXDataGridText();
    const [selectedGame, setSelectedGame] = useState<planningEntry | null>(null);
    const t = useTranslations("planning");

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }

    const columns = generateColumns({
        titleLabel: t("columns.title"),
        platformLabel: t("columns.platform"),
        releaseDateLabel: t("columns.releaseDate"),
        endDateLabel: t("columns.endDate"),
        statusLabel: t("columns.status"),
        statesLabels: {
            RECORDED: t("states.RECORDED"),
            PENDING: t("states.PENDING")
        }
    });

    const handleRowClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedGame(params.row as planningEntry);
    };

    return (
        <>
            <DataGrid 
                showToolbar
                rows={data} 
                columns={columns} 
                onRowClick={handleRowClick}
                disableRowSelectionOnClick 
                localeText={customLocaleText}
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
                        sortModel: [{ field: 'availableAt', sort: 'asc' }],
                    },
                    columns: {
                        columnVisibilityModel: {
                            // Hide columns endAt, the other columns will remain visible
                            endAt: false
                        }
                    }
                }}
            />
            {selectedGame && (
                <GameDetailView 
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                    showVoteSection={false}
                />
            )}
        </>
    )
}