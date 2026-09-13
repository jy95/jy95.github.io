import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
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
        expect(calledUrl(fetchMock).pathname).toBe('/api/backlog');
    });

    it('uses the shared RTK Query API', () => {
        expect(backlogAPI.reducerPath).toBe('api');
    });
});
