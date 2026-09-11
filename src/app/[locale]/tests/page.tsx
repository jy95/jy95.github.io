"use client";

// hooks
import { useGetTestsQuery } from "@/redux/services/testsAPI";

// Components
import { CardGrid } from "@/features/games/components/CardGrid";
import QueryErrorState from "@/components/common/QueryErrorState";

export default function TestsPage() {

    // Using a query hook automatically fetches data and returns query values
    const { data, error, isLoading, refetch } = useGetTestsQuery({});

    if (error) {
        return <QueryErrorState onRetry={refetch} />;
    }

    if (isLoading) {
        return <>Loading</>;
    }

    if (!data) {
        return null;
    }

    return (
        <CardGrid items={data.items} size={{
            xs: 12,
            sm: 6,
            md: 3,
            // 5 items for this screen size
            lg: 2.4
        }} />

    )
}