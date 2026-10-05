"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import CatalogEntityCard from "@/features/catalog/CatalogEntityCard";

export type CompanyCardEntry = {
    id: number;
    title: string;
    imagePath: string;
    gamesCount: number;
};

export default function CompanyCard({ company }: { company: CompanyCardEntry }) {
    const router = useRouter();
    const t = useTranslations("companies");

    return <CatalogEntityCard item={company} countLabel={t("gamesCount", { count: company.gamesCount })}
        onNavigate={item => router.push({ pathname: "/companies/[id]", params: { id: String(item.id) } })} />;
}
