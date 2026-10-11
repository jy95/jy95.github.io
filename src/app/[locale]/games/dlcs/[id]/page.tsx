"use client";

import { useTranslations } from "next-intl";

import { useGetDlcQuery } from "@/redux/services/dlcsAPI";
import { DetailQueryBoundary } from "@/components/common/DetailQueryBoundary";
import { useDetailRouteId } from "@/hooks/useDetailRouteId";
import { useEntityGamesDetail } from "@/features/catalog/useEntityGamesDetail";
import { UNRANKED_SORT_OPTIONS } from "@/features/catalog/gameSorting";
import EntityGamesDetail from "@/features/catalog/EntityGamesDetail";
import type { DlcDetail } from "@/domain/dlcs/types";

export default function DlcDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = useDetailRouteId(params);
    const { data, error, isLoading, refetch } = useGetDlcQuery(id);

    return (
        <DetailQueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch}>
            {(group) => <DlcGames group={group} />}
        </DetailQueryBoundary>
    );
}

function DlcGames({ group }: { group: DlcDetail }) {
    const t = useTranslations("dlcs");
    const { labels, onBack } = useEntityGamesDetail("dlcs");
    const games = group.items;
    return <EntityGamesDetail name={group.name} games={games} countLabel={t("dlcsCount", { count: group.dlcsCount })} onBack={onBack}
        labels={labels} category="dlcs" sortOptions={UNRANKED_SORT_OPTIONS} />;
}
