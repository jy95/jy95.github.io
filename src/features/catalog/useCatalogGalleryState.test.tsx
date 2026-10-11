import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCatalogGalleryState } from './useCatalogGalleryState';
import type { NameCountSort } from './NameCountSortSelect';

describe('useCatalogGalleryState', () => {
    it('resets each destination before updating arguments and preserves the other field', () => {
        const observed: unknown[] = [];
        const reset = vi.fn(() => { observed.push(result.current.args); });
        const { result } = renderHook(() => useCatalogGalleryState<NameCountSort>('nameAsc', reset));
        expect(result.current.args).toEqual({ filter: '', sort: 'nameAsc', pageSize: 12 });
        act(() => result.current.onFilterChange('Batman'));
        expect(reset).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'nameAsc', pageSize: 12 });
        expect(observed[0]).toEqual({ filter: '', sort: 'nameAsc', pageSize: 12 });
        act(() => result.current.onSortChange('countDesc'));
        expect(reset).toHaveBeenLastCalledWith({ filter: 'Batman', sort: 'countDesc', pageSize: 12 });
        expect(observed[1]).toEqual({ filter: 'Batman', sort: 'nameAsc', pageSize: 12 });
        expect(result.current.args).toEqual({ filter: 'Batman', sort: 'countDesc', pageSize: 12 });
    });
});
