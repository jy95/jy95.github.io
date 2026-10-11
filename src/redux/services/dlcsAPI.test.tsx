import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);
const { dlcsAPI, resetDlcPages } = await import('./dlcsAPI');

function makeStore() {
    return configureStore({
        reducer: { [dlcsAPI.reducerPath]: dlcsAPI.reducer },
        middleware: (getDefault) => getDefault().concat(dlcsAPI.middleware),
    });
}

const response = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('dlcsAPI', () => {
    beforeEach(() => { fetchMock.mockReset().mockImplementation(async (input: Request) => response({ items: [], total_items: 2, pageSize: 12, total_pages: 2, page: Number(new URL(input.url).searchParams.get('page')) })); });
    it('includes filter, sort and page size on every page and separates caches', async () => {
        const store = makeStore();
        const args = { filter: 'Batman & Robin/é', sort: 'countAsc' as const, pageSize: 12 };
        await store.dispatch(dlcsAPI.endpoints.getDlcs.initiate(args));
        await store.dispatch(dlcsAPI.endpoints.getDlcs.initiate(args, { direction: 'forward', forceRefetch: true }));
        expect(calledUrl(fetchMock, 1).searchParams.get('page')).toBe('2');
        expect(calledUrl(fetchMock, 1).searchParams.get('filter')).toBe('Batman & Robin/é');
        expect(calledUrl(fetchMock, 1).searchParams.get('sort')).toBe('countAsc');
        expect(calledUrl(fetchMock, 1).searchParams.get('pageSize')).toBe('12');
        await store.dispatch(dlcsAPI.endpoints.getDlcs.initiate({ ...args, filter: 'Zelda' }));
        expect(calledUrl(fetchMock, 2).searchParams.get('page')).toBe('1');
        const firstPage = dlcsAPI.endpoints.getDlcs.select(args)(store.getState()).data?.pages[0];
        store.dispatch(resetDlcPages(args));
        const cached = dlcsAPI.endpoints.getDlcs.select(args)(store.getState()).data;
        expect(cached?.pages).toEqual([firstPage]);
        expect(cached?.pageParams).toEqual([1]);
        await store.dispatch(dlcsAPI.endpoints.getDlcs.initiate(args));
        expect(dlcsAPI.endpoints.getDlcs.select(args)(store.getState()).data?.pages).toHaveLength(1);
    });
    it('encodes detail identifiers', async () => {
        await makeStore().dispatch(dlcsAPI.endpoints.getDlcById.initiate('a/b'));
        expect(calledUrl(fetchMock).pathname).toBe('/api/dlcs/a%2Fb');
    });
});
