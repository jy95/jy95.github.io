import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);

// 4. Dynamically import gamesAPI after fetch and Request are stubbed
const { gamesAPI } = await import('./gamesAPI');

function makeStore() {
    return configureStore({
        reducer: { [gamesAPI.reducerPath]: gamesAPI.reducer },
        middleware: (getDefault) => getDefault().concat(gamesAPI.middleware),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

const emptyPage = {
    items: [],
    total_items: 0,
    total_pages: 1,
    pageSize: 12,
    page: 1,
};

describe('gamesAPI query building (getGames)', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse(emptyPage));
    });

    it('includes page and pageSize even with no filters', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [],
                pageSize: 12,
            })
        );

        const url = calledUrl(fetchMock);
        expect(url.searchParams.get('page')).toBe('1');
        expect(url.searchParams.get('pageSize')).toBe('12');
    });

    it('hits the /api/games endpoint', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [],
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).pathname).toBe('/api/games');
    });

    it('serializes a selected_title filter as a plain query param', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [{ key: 'selected_title', value: 'zelda' }],
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('selected_title')).toBe('zelda');
    });

    it('serializes a selected_platform filter, converting the number to a string', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [{ key: 'selected_platform', value: 6 }],
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('selected_platform')).toBe('6');
    });

    it('serializes selected_genres as one repeated param per genre, in order', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [{ key: 'selected_genres', value: [1, 2, 3] }],
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.getAll('selected_genres')).toEqual([
            '1',
            '2',
            '3',
        ]);
    });

    it('omits selected_genres entirely when the array is empty', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [{ key: 'selected_genres', value: [] }],
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.getAll('selected_genres')).toEqual([]);
    });

    it('combines title, platform and genre filters together in a single request', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [
                    { key: 'selected_title', value: 'mario' },
                    { key: 'selected_platform', value: 1 },
                    { key: 'selected_genres', value: [5] },
                ],
                pageSize: 12,
            })
        );

        const url = calledUrl(fetchMock);
        expect(url.searchParams.get('selected_title')).toBe('mario');
        expect(url.searchParams.get('selected_platform')).toBe('1');
        expect(url.searchParams.getAll('selected_genres')).toEqual(['5']);
    });

    it('respects a different pageSize value in the query string', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [],
                pageSize: 24,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('pageSize')).toBe('24');
    });

    it('starts at page 1 on the initial fetch, per initialPageParam', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: [],
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('page')).toBe('1');
    });
});
