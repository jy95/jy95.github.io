"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import CatalogEntityCard from "@/features/catalog/CatalogEntityCard";
import type { DlcSummary } from "@/domain/dlcs/types";

export default function DlcCard({ group }: { group: DlcSummary }) {
    const t = useTranslations("dlcs");
    const router = useRouter();
    return <CatalogEntityCard item={{ ...group, title: group.name, gamesCount: group.dlcsCount }} objectFit="cover"
        countLabel={t("dlcsCount", { count: group.dlcsCount })}
        onNavigate={item => router.push({ pathname: "/games/dlcs/[id]", params: { id: item.id } })} />;
}
