import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);

const { relatedGamesAPI } = await import('./relatedGamesAPI');

function makeStore() {
    return configureStore({
        reducer: { [relatedGamesAPI.reducerPath]: relatedGamesAPI.reducer },
        middleware: (getDefault) => getDefault().concat(relatedGamesAPI.middleware),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('relatedGamesAPI.getRelatedGames', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse({}));
    });

    it('requests /api/related-games', async () => {
        await makeStore().dispatch(relatedGamesAPI.endpoints.getRelatedGames.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/related-games');
    });
});