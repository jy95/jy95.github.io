import { useEffect, useRef } from 'react';
import { removeSelections } from '@/features/selection/storage/store';
import type { SelectionIdentifier } from '@/domain/selection/types';

/** Called only after hydration and successful loading of the complete catalogue. */
export function useMissingSelectionCleanup(missing: SelectionIdentifier[], enabled: boolean) {
    const attempted = useRef<SelectionIdentifier[] | null>(null);

    useEffect(() => {
        if (!enabled || missing.length === 0 || attempted.current === missing) return;
        // Do not retry a failed write on rerenders or repeated effect setup.
        attempted.current = missing;
        removeSelections(missing);
    }, [missing, enabled]);
}
