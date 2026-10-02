"use client";

import { useGetSelectionCatalogueQuery } from "@/redux/services/selectionAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import SkeletonGrid from "@/components/common/SkeletonGrid";
import SelectionPage from "./SelectionPage";

export default function SelectionPageLoader() {
    const { data, error, isLoading, refetch } = useGetSelectionCatalogueQuery();

    return (
        <QueryBoundary
            error={error}
            isLoading={isLoading}
            data={data}
            onRetry={refetch}
            loadingFallback={<SkeletonGrid count={5} height={50} />}
        >
            {(catalogue) => <SelectionPage catalogue={catalogue} />}
        </QueryBoundary>
    );
}