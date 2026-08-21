import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// 1. Stub global location so relative URLs can be resolved
vi.stubGlobal('location', new URL('http://localhost'));

// 2. Make Node's Request resolve relative URLs like a browser Request
const NativeRequest = globalThis.Request;
vi.stubGlobal(
    'Request',
    class extends NativeRequest {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
            super(
                typeof input === 'string'
                    ? new URL(input, globalThis.location.href).toString()
                    : input,
                init
            );
        }
    }
);

// 3. Stub global fetch BEFORE importing tierListAPI
const fetchMock = vi.fn();
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

    function calledUrl(callIndex = 0): URL {
        const raw = fetchMock.mock.calls[callIndex][0];
        const urlStr = typeof raw === 'string' ? raw : raw.url;
        return new URL(urlStr, 'http://localhost');
    }

    it('getGamesTierList hits /api/tier-lists/games', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getGamesTierList.initiate());
        expect(calledUrl().pathname).toBe('/api/tier-lists/games');
    });

    it('getBacklogTierList hits /api/tier-lists/backlog', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getBacklogTierList.initiate());
        expect(calledUrl().pathname).toBe('/api/tier-lists/backlog');
    });

    it('getTestsTierList hits /api/tier-lists/tests', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getTestsTierList.initiate());
        expect(calledUrl().pathname).toBe('/api/tier-lists/tests');
    });

    it('getSortedCategories hits /api/tier-lists/categories with an ascending sort param', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getSortedCategories.initiate('asc'));
        const url = calledUrl();
        expect(url.pathname).toBe('/api/tier-lists/categories');
        expect(url.searchParams.get('sort')).toBe('asc');
    });

    it('getSortedCategories forwards a descending sort param', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getSortedCategories.initiate('desc'));
        expect(calledUrl().searchParams.get('sort')).toBe('desc');
    });

    it('builds distinct URLs for asc vs desc sort requests', async () => {
        const store = makeStore();
        await store.dispatch(tierListAPI.endpoints.getSortedCategories.initiate('asc'));
        const first = calledUrl(0).toString();

        await store.dispatch(tierListAPI.endpoints.getSortedCategories.initiate('desc'));
        const second = calledUrl(1).toString();

        expect(first).not.toBe(second);
    });
});
