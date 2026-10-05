"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import CatalogEntityCard from "@/features/catalog/CatalogEntityCard";
import type { SeriesSummary } from "@/domain/series/types";

export default function SeriesCard({ series }: { series: SeriesSummary }) {
    const t = useTranslations("series");
    const router = useRouter();
    return <CatalogEntityCard item={{ ...series, title: series.name }} countLabel={t("gamesCount", { count: series.gamesCount })}
        onNavigate={item => router.push({ pathname: "/games/series/[id]", params: { id: String(item.id) } })} />;
}
