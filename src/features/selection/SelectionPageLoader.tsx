"use client";

import { useSearchParams } from "next/navigation";
import { useGetSelectionCatalogueQuery } from "@/redux/services/selectionAPI";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import SkeletonGrid from "@/components/common/SkeletonGrid";
import SelectionPage from "./SelectionPage";
import { usePersonalSelection } from "./selectionPersistence";
import type { SelectionEntry } from "./catalogue";

// Stable reference: SelectionPage memoizes on the catalogue identity.
const EMPTY_CATALOGUE: SelectionEntry[] = [];

export default function SelectionPageLoader() {
    const hasSharedLink = useSearchParams().has("entries");
    const { hydrated, ids } = usePersonalSelection();

    // Nothing to resolve (empty selection, no shared link) means no catalogue download.
    // Before hydration we can't know yet, so we wait instead of firing a speculative request.
    const needsCatalogue = hasSharedLink || (hydrated && ids.length > 0);
    const { data, error, isLoading, refetch } = useGetSelectionCatalogueQuery(undefined, { skip: !needsCatalogue });

    return (
        <QueryBoundary
            error={error}
            isLoading={needsCatalogue ? isLoading : !hydrated}
            data={data ?? (needsCatalogue ? undefined : EMPTY_CATALOGUE)}
            onRetry={refetch}
            loadingFallback={<SkeletonGrid count={5} height={50} />}
        >
            {(catalogue) => <SelectionPage catalogue={catalogue} />}
        </QueryBoundary>
    );
}