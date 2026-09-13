import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);

// 4. Dynamically import testsAPI after fetch and Request are stubbed
const { testsAPI } = await import('./testsAPI');

function makeStore() {
    return configureStore({
        reducer: { [testsAPI.reducerPath]: testsAPI.reducer },
        middleware: (getDefault) => getDefault().concat(testsAPI.middleware),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

const emptyPage = { items: [], total_items: 0, limit: -1, offset: 0 };

describe('testsAPI query building (getTests)', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse(emptyPage));
    });

    it('hits the /api/tests endpoint', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({}));
        expect(calledUrl(fetchMock).pathname).toBe('/api/tests');
    });

    it('omits limit and offset entirely when neither is provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({}));

        const url = calledUrl(fetchMock);
        expect(url.searchParams.has('limit')).toBe(false);
        expect(url.searchParams.has('offset')).toBe(false);
        expect(url.search).toBe('');
    });

    it('includes limit as a string query param when provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 5 }));

        expect(calledUrl(fetchMock).searchParams.get('limit')).toBe('5');
        expect(calledUrl(fetchMock).searchParams.has('offset')).toBe(false);
    });

    it('includes offset as a string query param when provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ offset: 3 }));

        expect(calledUrl(fetchMock).searchParams.get('offset')).toBe('3');
        expect(calledUrl(fetchMock).searchParams.has('limit')).toBe(false);
    });

    it('includes both limit and offset together when both are provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 10, offset: 2 }));

        const url = calledUrl(fetchMock);
        expect(url.searchParams.get('limit')).toBe('10');
        expect(url.searchParams.get('offset')).toBe('2');
    });

    it('treats a limit of 0 as an explicit value, not as "omit"', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 0 }));

        expect(calledUrl(fetchMock).searchParams.get('limit')).toBe('0');
    });

    it('treats an offset of 0 as an explicit value, not as "omit"', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ offset: 0 }));

        expect(calledUrl(fetchMock).searchParams.get('offset')).toBe('0');
    });

});
