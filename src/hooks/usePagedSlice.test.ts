import { act, renderHook } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { usePagedSlice } from './usePagedSlice';

const range = (length: number) => Array.from({ length }, (_, index) => index);

it('shows the first page and loads more until exhausted', () => {
    const items = range(25);
    const { result } = renderHook(() => usePagedSlice(items, 10));
    expect(result.current.visible).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);
    act(() => result.current.loadMore());
    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
});

it('accumulates pages when loadMore is called twice in one batch', () => {
    const items = range(40);
    const { result } = renderHook(() => usePagedSlice(items, 10));
    act(() => { result.current.loadMore(); result.current.loadMore(); });
    expect(result.current.visible).toHaveLength(30);
});

it.each(['items', 'pageSize', 'both'])('commits only the first page when %s changes', change => {
    const items = range(30);
    const commits: { visible: number[]; hasMore: boolean }[] = [];
    const { result, rerender } = renderHook(({ items, pageSize }) => {
        const page = usePagedSlice(items, pageSize);
        useLayoutEffect(() => {
            commits.push({ visible: page.visible, hasMore: page.hasMore });
        });
        return page;
    }, {
        initialProps: { items, pageSize: 10 },
    });
    act(() => { result.current.loadMore(); result.current.loadMore(); });
    expect(result.current.visible).toHaveLength(30);
    expect(result.current.hasMore).toBe(false);

    const nextItems = change === 'pageSize' ? items : range(30).map(item => item + 100);
    const nextPageSize = change === 'items' ? 10 : 5;
    commits.length = 0;
    rerender({ items: nextItems, pageSize: nextPageSize });
    expect(commits).toEqual([{ visible: nextItems.slice(0, nextPageSize), hasMore: true }]);

    act(() => result.current.loadMore());
    expect(result.current.visible).toEqual(nextItems.slice(0, nextPageSize * 2));
});

it('keeps the same slice reference across unrelated renders', () => {
    const items = range(30);
    const { result, rerender } = renderHook(() => usePagedSlice(items, 10));
    const first = result.current.visible;
    rerender();
    expect(result.current.visible).toBe(first);
});
