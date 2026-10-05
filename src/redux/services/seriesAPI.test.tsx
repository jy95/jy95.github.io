import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);
const { seriesAPI, resetPages } = await import('./seriesAPI');

function makeStore() {
    return configureStore({
        reducer: { [seriesAPI.reducerPath]: seriesAPI.reducer },
        middleware: (getDefault) => getDefault().concat(seriesAPI.middleware),
    });
}

const response = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('seriesAPI', () => {
    beforeEach(() => { fetchMock.mockReset().mockImplementation(async (input: Request) => response({ items: [], total_pages: 2, page: Number(new URL(input.url).searchParams.get('page')) })); });
    it('includes filter, sort and page size on every page and separates caches', async () => {
        const store = makeStore();
        const args = { filter: 'Batman & Robin/é', sort: 'countAsc' as const, pageSize: 12 };
        await store.dispatch(seriesAPI.endpoints.getSeries.initiate(args));
        await store.dispatch(seriesAPI.endpoints.getSeries.initiate(args, { direction: 'forward', forceRefetch: true }));
        expect(calledUrl(fetchMock, 1).searchParams.get('page')).toBe('2');
        expect(calledUrl(fetchMock, 1).searchParams.get('filter')).toBe('Batman & Robin/é');
        expect(calledUrl(fetchMock, 1).searchParams.get('sort')).toBe('countAsc');
        expect(calledUrl(fetchMock, 1).searchParams.get('pageSize')).toBe('12');
        await store.dispatch(seriesAPI.endpoints.getSeries.initiate({ ...args, filter: 'Zelda' }));
        expect(calledUrl(fetchMock, 2).searchParams.get('page')).toBe('1');
        store.dispatch(resetPages(args));
        const cached = seriesAPI.endpoints.getSeries.select(args)(store.getState()).data;
        expect(cached?.pages).toHaveLength(1);
        expect(cached?.pageParams).toEqual([1]);
        await store.dispatch(seriesAPI.endpoints.getSeries.initiate(args));
        expect(seriesAPI.endpoints.getSeries.select(args)(store.getState()).data?.pages).toHaveLength(1);
    });
    it('encodes detail identifiers', async () => {
        await makeStore().dispatch(seriesAPI.endpoints.getSeriesById.initiate('a/b'));
        expect(calledUrl(fetchMock).pathname).toBe('/api/series/a%2Fb');
    });
});
