"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";

import { useGetCompaniesQuery } from "@/redux/services/companiesAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import CompanyCard from "@/features/companies/CompanyCard";
import RoleToggle, { type RoleFilter } from "./_client/RoleToggle";

export default function CompaniesGallery() {
    const { data, error, isLoading, refetch } = useGetCompaniesQuery();
    const [role, setRole] = useState<RoleFilter>("all");
    const t = useTranslations("companies");

    return (
        <>
            <RoleToggle
                value={role}
                onChange={setRole}
                labels={{ all: t("roles.all"), developer: t("roles.developer"), publisher: t("roles.publisher") }}
            />
            <QueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch}>
                {(companies) => <CompaniesGrid companies={companies} role={role} />}
            </QueryBoundary>
        </>
    );
}

function CompaniesGrid({
    companies, role,
}: {
    companies: NonNullable<ReturnType<typeof useGetCompaniesQuery>["data"]>;
    role: RoleFilter;
}) {
    const entries = useMemo(() => companies
        .map((company) => {
            const games = role === "developer" ? company.developerGames
                : role === "publisher" ? company.publisherGames
                : dedupeById([...company.developerGames, ...company.publisherGames]);
            return { id: company.id, title: company.name, imagePath: company.imagePath, gamesCount: games.length };
        })
        .filter((company) => company.gamesCount > 0),
    [companies, role]);

    return (
        <Grid container spacing={1} rowSpacing={1}>
            {entries.map((company) => (
                <Grid key={company.id} size={{ xs: 6, md: 4, lg: 2 }}>
                    <CompanyCard company={company} />
                </Grid>
            ))}
        </Grid>
    );
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
    return [...new Map(items.map((item) => [item.id, item])).values()];
}