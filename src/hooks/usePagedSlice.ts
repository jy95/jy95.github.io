import { useCallback, useMemo, useState } from 'react';

/**
 * Client-side "load more" over an in-memory list.
 *
 * - The visible slice is memoized, so memoized children only re-render when
 *   the slice really changes.
 * - Paging resets to the first page whenever the source array identity
 *   changes (new filters, sort, data) or pageSize changes, before committing.
 */
export function usePagedSlice<T>(items: readonly T[], pageSize: number) {
    const [visibleCount, setVisibleCount] = useState(pageSize);
    const [previousInputs, setPreviousInputs] = useState({ items, pageSize });

    // Reset to first page when items or pageSize change
    const shouldReset = previousInputs.items !== items || previousInputs.pageSize !== pageSize;
    const effectiveLimit = shouldReset ? pageSize : visibleCount;
    if (shouldReset) {
        setPreviousInputs({ items, pageSize });
        setVisibleCount(pageSize);
    }

    const visible = useMemo(() => items.slice(0, effectiveLimit), [items, effectiveLimit]);

    const loadMore = useCallback(
        () => setVisibleCount(current => Math.min(current + pageSize, items.length)),
        [items.length, pageSize],
    );

    return { visible, hasMore: effectiveLimit < items.length, loadMore };
}
