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

    it('shares one cache entry for equivalent filter selections', async () => {
        const store = makeStore();
        const first = store.dispatch(gamesAPI.endpoints.getGames.initiate({
            filters: {
                genres: [10, 2, 2],
                platform: 1,
            }, pageSize: 12,
        }));
        await first;
        const second = store.dispatch(gamesAPI.endpoints.getGames.initiate({
            filters: {
                title: '',
                platform: 1,
                genres: [2, 10],
            }, pageSize: 12,
        }));
        await second;
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(Object.keys(store.getState()[gamesAPI.reducerPath].queries)).toHaveLength(1);
        await store.dispatch(gamesAPI.endpoints.getGames.initiate({ filters: {}, pageSize: 24 }));
        expect(fetchMock).toHaveBeenCalledTimes(2);
        first.unsubscribe();
        second.unsubscribe();
        store.dispatch(gamesAPI.util.resetApiState());
    });

    it('starts a new infinite result at page one when filters change', async () => {
        fetchMock.mockImplementation(async (request: Request) => {
            const params = new URL(request.url).searchParams;
            const page = Number(params.get('page'));
            return jsonResponse({ ...emptyPage, page, total_pages: 2, total_items: params.get('title') === 'Zelda' ? 20 : 10 });
        });
        const store = makeStore();
        const zelda = { filters: { title: 'Zelda' }, pageSize: 12 };
        const mario = { filters: { title: 'Mario' }, pageSize: 12 };
        const first = store.dispatch(gamesAPI.endpoints.getGames.initiate(zelda));
        await first;
        await store.dispatch(gamesAPI.endpoints.getGames.initiate(zelda, { direction: 'forward' }));
        expect(gamesAPI.endpoints.getGames.select(zelda)(store.getState()).data?.pages).toHaveLength(2);

        const changed = store.dispatch(gamesAPI.endpoints.getGames.initiate(mario));
        await changed;
        expect(gamesAPI.endpoints.getGames.select(mario)(store.getState()).data?.pages).toHaveLength(1);
        expect(gamesAPI.endpoints.getGames.select(mario)(store.getState()).data?.pages[0].total_items).toBe(10);
        expect(fetchMock.mock.calls.map((_, index) => calledUrl(fetchMock, index).searchParams.get('page'))).toEqual(['1', '2', '1']);
        first.unsubscribe();
        changed.unsubscribe();
        store.dispatch(gamesAPI.util.resetApiState());
    });

    it('includes page and pageSize even with no filters', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {},
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
                filters: {},
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).pathname).toBe('/api/games');
    });

    it('serializes a title filter as a plain query param', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {title: 'zelda'},
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('title')).toBe('zelda');
    });

    it('serializes a platform filter, converting the number to a string', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {platform: 6},
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('platform')).toBe('6');
    });

    it('serializes genres as one repeated param per genre, in order', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {genres: [1, 2, 3]},
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.getAll('genres')).toEqual([
            '1',
            '2',
            '3',
        ]);
    });

    it('omits genres entirely when the array is empty', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {genres: []},
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.getAll('genres')).toEqual([]);
    });

    it('combines title, platform and genre filters together in a single request', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {
                    title: 'mario',
                    platform: 1,
                    genres: [5],
                },
                pageSize: 12,
            })
        );

        const url = calledUrl(fetchMock);
        expect(url.searchParams.get('title')).toBe('mario');
        expect(url.searchParams.get('platform')).toBe('1');
        expect(url.searchParams.getAll('genres')).toEqual(['5']);
    });

    it('respects a different pageSize value in the query string', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {},
                pageSize: 24,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('pageSize')).toBe('24');
    });

    it('starts at page 1 on the initial fetch, per initialPageParam', async () => {
        const store = makeStore();
        await store.dispatch(
            gamesAPI.endpoints.getGames.initiate({
                filters: {},
                pageSize: 12,
            })
        );

        expect(calledUrl(fetchMock).searchParams.get('page')).toBe('1');
    });
});
