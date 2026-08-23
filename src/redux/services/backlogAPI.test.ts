import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

vi.stubGlobal('location', new URL('http://localhost'));

const NativeRequest = globalThis.Request;

vi.stubGlobal(
    'Request',
    class extends NativeRequest {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
            super(
                typeof input === 'string'
                    ? new URL(input, globalThis.location.href).toString()
                    : input,
                init,
            );
        }
    },
);

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const { backlogAPI } = await import('./backlogAPI');

function makeStore() {
    return configureStore({
        reducer: {
            [backlogAPI.reducerPath]: backlogAPI.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(backlogAPI.middleware),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

function calledPath(callIndex = 0): string {
    const raw = fetchMock.mock.calls[callIndex][0];
    const url = typeof raw === 'string' ? raw : raw.url;
    return new URL(url, 'http://localhost').pathname;
}

describe('backlogAPI.getBacklog', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(
            jsonResponse([
                {
                    slug: 'example-game',
                    status: 'playing',
                },
            ]),
        );
    });

    it('requests /api/backlog', async () => {
        const result = await makeStore().dispatch(
            backlogAPI.endpoints.getBacklog.initiate(),
        );

        expect(result.data).toEqual([
            {
                slug: 'example-game',
                status: 'playing',
            },
        ]);
        expect(calledPath()).toBe('/api/backlog');
    });

    it('uses the shared RTK Query API', () => {
        expect(backlogAPI.reducerPath).toBe('api');
    });
});
