"use client";

import { use, useMemo } from "react";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";

import { useGetCompaniesQuery } from "@/redux/services/companiesAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { CardGrid } from "@/features/games/components/CardGrid";

export default function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, error, isLoading, refetch } = useGetCompaniesQuery();

    return (
        <QueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch}>
            {(companies) => {
                const company = companies.find((c) => String(c.id) === id);
                if (!company) return notFound();
                return <CompanyGames company={company} />;
            }}
        </QueryBoundary>
    );
}

function CompanyGames({ company }: { company: { name: string; developerGames: any[]; publisherGames: any[] } }) {
    const games = useMemo(
        () => [...new Map([...company.developerGames, ...company.publisherGames].map((g) => [g.id, g])).values()],
        [company]
    );

    return (
        <>
            <Typography variant="h5" gutterBottom>{company.name}</Typography>
            <CardGrid items={games} size={{ xs: 6, md: 4, lg: 2 }} />
        </>
    );
}