"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { EntityGamesDetailLabels } from "./entityGamesDetailLabels";

export function useEntityGamesDetail(namespace: "companies" | "series") {
    const t = useTranslations(namespace);
    const common = useTranslations("common");
    const router = useRouter();
    const labels: EntityGamesDetailLabels = {
        back: t("back"), sort: t("sort.label"), loadMore: common("loadMore"),
        options: {
            titleAsc: t("sort.titleAsc"), titleDesc: t("sort.titleDesc"),
            durationAsc: t("sort.durationAsc"), durationDesc: t("sort.durationDesc"),
            tierAsc: t("sort.tierAsc"), tierDesc: t("sort.tierDesc"),
        },
    };
    return { labels, onBack: () => router.back() };
}
