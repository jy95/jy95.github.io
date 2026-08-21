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

// 3. Stub global fetch BEFORE importing testsAPI
const fetchMock = vi.fn();
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

    function calledUrl(callIndex = 0): URL {
        const raw = fetchMock.mock.calls[callIndex][0];
        const urlStr = typeof raw === 'string' ? raw : raw.url;
        return new URL(urlStr, 'http://localhost');
    }

    it('hits the /api/tests endpoint', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({}));
        expect(calledUrl().pathname).toBe('/api/tests');
    });

    it('omits limit and offset entirely when neither is provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({}));

        const url = calledUrl();
        expect(url.searchParams.has('limit')).toBe(false);
        expect(url.searchParams.has('offset')).toBe(false);
        expect(url.search).toBe('');
    });

    it('includes limit as a string query param when provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 5 }));

        expect(calledUrl().searchParams.get('limit')).toBe('5');
        expect(calledUrl().searchParams.has('offset')).toBe(false);
    });

    it('includes offset as a string query param when provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ offset: 3 }));

        expect(calledUrl().searchParams.get('offset')).toBe('3');
        expect(calledUrl().searchParams.has('limit')).toBe(false);
    });

    it('includes both limit and offset together when both are provided', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 10, offset: 2 }));

        const url = calledUrl();
        expect(url.searchParams.get('limit')).toBe('10');
        expect(url.searchParams.get('offset')).toBe('2');
    });

    it('treats a limit of 0 as an explicit value, not as "omit"', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 0 }));

        expect(calledUrl().searchParams.get('limit')).toBe('0');
    });

    it('treats an offset of 0 as an explicit value, not as "omit"', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ offset: 0 }));

        expect(calledUrl().searchParams.get('offset')).toBe('0');
    });

    it('builds distinct URLs for different limit/offset combinations', async () => {
        const store = makeStore();
        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 5, offset: 0 }));
        const first = calledUrl(0).toString();

        await store.dispatch(testsAPI.endpoints.getTests.initiate({ limit: 5, offset: 5 }));
        const second = calledUrl(1).toString();

        expect(first).not.toBe(second);
    });
});
