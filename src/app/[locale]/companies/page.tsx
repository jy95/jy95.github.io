"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Grid from "@mui/material/Grid";

import { useGetCompaniesQuery } from "@/redux/services/companiesAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import CompanyCard from "@/features/companies/CompanyCard";
import RoleToggle, { type RoleFilter } from "./_client/RoleToggle";

import type { CompanyType as Company } from "@/app/api/companies/route";

export default function CompaniesGallery() {
    const { data, error, isLoading, refetch } = useGetCompaniesQuery();
    const [role, setRole] = useState<RoleFilter>("all");
    const t = useTranslations("companies");

    return (
        <>
            <RoleToggle
                value={role}
                onChange={setRole}
                labels={{
                    all: t("roles.all"),
                    developer: t("roles.developer"),
                    publisher: t("roles.publisher"),
                }}
            />
            <QueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch}>
                {(companies) => <CompaniesGrid companies={companies} role={role} />}
            </QueryBoundary>
        </>
    );
}

function getGamesCount(company: Company, role: RoleFilter): number {
    if (role === "developer") return company.developerGames.length;
    if (role === "publisher") return company.publisherGames.length;

    // Deduplicate IDs directly to avoid allocating intermediate spread arrays
    const uniqueIds = new Set<string>();
    company.developerGames.forEach((g) => uniqueIds.add(g.id));
    company.publisherGames.forEach((g) => uniqueIds.add(g.id));

    return uniqueIds.size;
}

function CompaniesGrid({ companies, role }: { companies: Company[]; role: RoleFilter }) {
    const visibleCompanies = useMemo(() => {
        return companies.reduce<Array<Company & { gamesCount: number }>>((acc, company) => {
            const gamesCount = getGamesCount(company, role);
            if (gamesCount > 0) {
                acc.push({ ...company, gamesCount });
            }
            return acc;
        }, []);
    }, [companies, role]);

    return (
        <Grid container spacing={1} rowSpacing={1}>
            {visibleCompanies.map((company) => (
                <Grid key={company.id} size={{ xs: 6, md: 4, lg: 2 }}>
                    <CompanyCard
                        company={{
                            id: company.id,
                            title: company.name,
                            imagePath: company.imagePath,
                            gamesCount: company.gamesCount,
                        }}
                    />
                </Grid>
            ))}
        </Grid>
    );
}