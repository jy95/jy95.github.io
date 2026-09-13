import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);

// 4. Dynamically import tierListAPI after fetch and Request are stubbed
const { tierListAPI } = await import('./tierListAPI');

function makeStore() {
    return configureStore({
        reducer: { [tierListAPI.reducerPath]: tierListAPI.reducer },
        middleware: (getDefault) => getDefault().concat(tierListAPI.middleware),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('tierListAPI query building', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse({}));
    });

    it('getGamesTierList hits /api/tier-lists/games', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getGamesTierList.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/tier-lists/games');
    });

    it('getBacklogTierList hits /api/tier-lists/backlog', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getBacklogTierList.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/tier-lists/backlog');
    });

    it('getTestsTierList hits /api/tier-lists/tests', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getTestsTierList.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/tier-lists/tests');
    });

    it('getSortedCategories hits /api/tier-lists/categories with an ascending sort param', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getSortedCategories.initiate('asc'));
        const url = calledUrl(fetchMock);
        expect(url.pathname).toBe('/api/tier-lists/categories');
        expect(url.searchParams.get('sort')).toBe('asc');
    });

    it('getSortedCategories forwards a descending sort param', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getSortedCategories.initiate('desc'));
        expect(calledUrl(fetchMock).searchParams.get('sort')).toBe('desc');
    });
});
