"use client";

// Hooks
import { useTranslations } from "next-intl";

// Redux
import { useGetPlanningQuery } from "@/redux/services/planningAPI";

// Components
import QueryErrorState from '@/components/common/QueryErrorState';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { GameDataGrid } from '@/components/common/GameDataGrid';

// columns
import generateColumns from "@/components/planning/tableColumns";

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

    return (
        <>
            <GameDataGrid
                rows={data ?? []}
                columns={columns}
                loading={isLoading}
                sortModel={[{ field: 'availableAt', sort: 'asc' }]}
                columnVisibilityModel={{ endAt: false }}
                showVoteSection={false}
            />
        </>
    );
}