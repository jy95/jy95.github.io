"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { EntityGamesDetailLabels } from "./entityGamesDetailLabels";

export function useEntityGamesDetail(namespace: "companies" | "series") {
    const t = useTranslations(namespace);
    const common = useTranslations("common");
    const gameSort = useTranslations("common.gameSort");
    const router = useRouter();
    const labels: EntityGamesDetailLabels = {
        back: t("back"), sort: gameSort("label"), loadMore: common("loadMore"),
        options: {
            titleAsc: gameSort("titleAsc"), titleDesc: gameSort("titleDesc"),
            durationAsc: gameSort("durationAsc"), durationDesc: gameSort("durationDesc"),
            tierAsc: gameSort("tierAsc"), tierDesc: gameSort("tierDesc"),
        },
    };
    return { labels, onBack: () => router.back() };
}
