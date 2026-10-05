"use client";

import { use } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";

import { useRouter } from "@/i18n/routing";
import { useGetSeriesQuery } from "@/redux/services/seriesAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import EntityGamesDetail from "@/features/catalog/EntityGamesDetail";
import type { SeriesDetail } from "@/domain/series/types";

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, error, isLoading, refetch } = useGetSeriesQuery(id);
    if (error && "status" in error && error.status === 404) return notFound();

    return (
        <QueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch} loadingFallback={<CircularProgress />}>
            {(series) => <SeriesGames series={series} />}
        </QueryBoundary>
    );
}

function SeriesGames({ series }: { series: SeriesDetail }) {
    const t = useTranslations("series");
    const common = useTranslations("common");
    const router = useRouter();
    const games = series.items;
    return <EntityGamesDetail name={series.name} games={games} countLabel={t("gamesCount", { count: series.gamesCount })} onBack={() => router.back()}
        labels={{ back: t("back"), sort: t("sort.label"), loadMore: common("loadMore"), options: {
            titleAsc: t("sort.titleAsc"), titleDesc: t("sort.titleDesc"), durationAsc: t("sort.durationAsc"),
            durationDesc: t("sort.durationDesc"), tierAsc: t("sort.tierAsc"), tierDesc: t("sort.tierDesc"),
        } }} />;
}
