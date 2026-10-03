import { act, renderHook } from '@testing-library/react';
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

it('resets to the first page when the source array changes', () => {
    const { result, rerender } = renderHook(({ items }) => usePagedSlice(items, 10), {
        initialProps: { items: range(30) },
    });
    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(20);
    rerender({ items: range(30) });
    expect(result.current.visible).toHaveLength(10);
});

it('keeps the same slice reference across unrelated renders', () => {
    const items = range(30);
    const { result, rerender } = renderHook(() => usePagedSlice(items, 10));
    const first = result.current.visible;
    rerender();
    expect(result.current.visible).toBe(first);
});