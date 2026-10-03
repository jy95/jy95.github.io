import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Client-side "load more" over an in-memory list.
 *
 * - The visible slice is memoized, so memoized children only re-render when
 *   the slice really changes.
 * - Paging resets to the first page whenever the source array identity
 *   changes (new filters, sort, data), without an effect and without an
 *   extra render pass.
 */
export function usePagedSlice<T>(items: readonly T[], pageSize: number) {
    const [visibleCount, setVisibleCount] = useState(pageSize);

    // Reset to first page when items or pageSize change
    useEffect(() => {
        setVisibleCount(pageSize);
    }, [items, pageSize]);

    const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

    const loadMore = useCallback(
        () => setVisibleCount(current => Math.min(current + pageSize, items.length)),
        [items.length, pageSize],
    );

    return { visible, hasMore: visibleCount < items.length, loadMore };
}
