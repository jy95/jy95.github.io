"use client";

import { useTranslations } from "next-intl";

import { useGetSeriesQuery } from "@/redux/services/seriesAPI";
import { DetailQueryBoundary } from "@/components/common/DetailQueryBoundary";
import { useDetailRouteId } from "@/hooks/useDetailRouteId";
import { useEntityGamesDetail } from "@/features/catalog/useEntityGamesDetail";
import EntityGamesDetail from "@/features/catalog/EntityGamesDetail";
import type { SeriesDetail } from "@/domain/series/types";

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = useDetailRouteId(params);
    const { data, error, isLoading, refetch } = useGetSeriesQuery(id);

    return (
        <DetailQueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch}>
            {(series) => <SeriesGames series={series} />}
        </DetailQueryBoundary>
    );
}

function SeriesGames({ series }: { series: SeriesDetail }) {
    const t = useTranslations("series");
    const { labels, onBack } = useEntityGamesDetail("series");
    const games = series.items;
    return <EntityGamesDetail name={series.name} games={games} countLabel={t("gamesCount", { count: series.gamesCount })} onBack={onBack}
        labels={labels} />;
}
