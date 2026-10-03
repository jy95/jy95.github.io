import { useCallback, useMemo, useState } from 'react';

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
    const [paging, setPaging] = useState({ items, limit: pageSize });
    const limit = paging.items === items ? paging.limit : pageSize;

    const visible = useMemo(() => items.slice(0, limit), [items, limit]);

    const loadMore = useCallback(
        () => setPaging(current => ({
            items,
            limit: (current.items === items ? current.limit : pageSize) + pageSize,
        })),
        [items, pageSize],
    );

    return { visible, hasMore: limit < items.length, loadMore };
}