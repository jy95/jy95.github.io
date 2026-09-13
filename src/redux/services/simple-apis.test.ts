import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);

const { genresAPI } = await import('./genresAPI');
const { seriesAPI } = await import('./seriesAPI');
const { dlcsAPI } = await import('./dlcsAPI');
const { statsAPI } = await import('./statsAPI');
const { platformsAPI } = await import('./platformsAPI');
const { planningAPI } = await import('./planningAPI');

type AnyApi = {
    reducerPath: string;
    reducer: unknown;
    middleware: unknown;
};

function makeStore(api: AnyApi) {
    return configureStore({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reducer: { [api.reducerPath]: api.reducer as any },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        middleware: (getDefault) => getDefault().concat(api.middleware as any),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('injected RTK Query endpoints', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse([]));
    });

    it('genresAPI.getGenres hits /api/genres', async () => {
        await makeStore(genresAPI).dispatch(genresAPI.endpoints.getGenres.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/genres');
    });

    it('seriesAPI.getSeries hits /api/series', async () => {
        await makeStore(seriesAPI).dispatch(seriesAPI.endpoints.getSeries.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/series');
    });

    it('dlcsAPI.getDLCs hits /api/dlcs', async () => {
        await makeStore(dlcsAPI).dispatch(dlcsAPI.endpoints.getDLCs.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/dlcs');
    });

    it('statsAPI.getStats hits /api/stats', async () => {
        await makeStore(statsAPI).dispatch(statsAPI.endpoints.getStats.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/stats');
    });

    it('platformsAPI.getPlatforms hits /api/platforms', async () => {
        await makeStore(platformsAPI).dispatch(platformsAPI.endpoints.getPlatforms.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/platforms');
    });

    it('planningAPI.getPlanning hits /api/planning', async () => {
        await makeStore(planningAPI).dispatch(planningAPI.endpoints.getPlanning.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/planning');
    });

    it('all injected APIs share the same reducerPath and cache', () => {
        const paths = [genresAPI, seriesAPI, dlcsAPI, statsAPI, platformsAPI, planningAPI].map(
            (api) => api.reducerPath
        );
        expect(new Set(paths).size).toBe(1);
        expect(paths[0]).toBe('api');
    });
});
