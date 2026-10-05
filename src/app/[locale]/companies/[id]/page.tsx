"use client";

import { useMemo } from "react";

import { useGetCompanyQuery } from "@/redux/services/companiesAPI";
import { DetailQueryBoundary } from "@/components/common/DetailQueryBoundary";
import { useDetailRouteId } from "@/hooks/useDetailRouteId";
import { useEntityGamesDetail } from "@/features/catalog/useEntityGamesDetail";
import EntityGamesDetail from "@/features/catalog/EntityGamesDetail";
import type { CompanyType } from "@/app/api/companies/route";

export default function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
    const id = useDetailRouteId(params);
    const { data, error, isLoading, refetch } = useGetCompanyQuery(id);

    return (
        <DetailQueryBoundary error={error} isLoading={isLoading} data={data} onRetry={refetch}>
            {(company) => <CompanyGames company={company} />}
        </DetailQueryBoundary>
    );
}

function CompanyGames({ company }: { company: CompanyType }) {
    const { labels, onBack } = useEntityGamesDetail("companies");
    const games = useMemo(() => [...new Map([...company.developerGames, ...company.publisherGames].map(game => [game.id, game])).values()], [company]);
    return <EntityGamesDetail name={company.name} games={games} onBack={onBack}
        labels={labels} />;
}
