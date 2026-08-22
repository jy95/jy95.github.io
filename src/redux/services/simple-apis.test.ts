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

// 3. Stub global fetch BEFORE importing any of the API slices
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// 4. Dynamically import every slice after fetch and Request are stubbed
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

function calledPath(callIndex = 0): string {
    const raw = fetchMock.mock.calls[callIndex][0];
    const urlStr = typeof raw === 'string' ? raw : raw.url;
    return new URL(urlStr, 'http://localhost').pathname;
}

describe('single-endpoint RTK Query API slices', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse([]));
    });

    it('genresAPI.getGenres hits /api/genres', async () => {
        await makeStore(genresAPI).dispatch(genresAPI.endpoints.getGenres.initiate());
        expect(calledPath()).toBe('/api/genres');
    });

    it('seriesAPI.getSeries hits /api/series', async () => {
        await makeStore(seriesAPI).dispatch(seriesAPI.endpoints.getSeries.initiate());
        expect(calledPath()).toBe('/api/series');
    });

    it('dlcsAPI.getDLCs hits /api/dlcs', async () => {
        await makeStore(dlcsAPI).dispatch(dlcsAPI.endpoints.getDLCs.initiate());
        expect(calledPath()).toBe('/api/dlcs');
    });

    it('statsAPI.getStats hits /api/stats', async () => {
        await makeStore(statsAPI).dispatch(statsAPI.endpoints.getStats.initiate());
        expect(calledPath()).toBe('/api/stats');
    });

    it('platformsAPI.getPlatforms hits /api/platforms', async () => {
        await makeStore(platformsAPI).dispatch(platformsAPI.endpoints.getPlatforms.initiate());
        expect(calledPath()).toBe('/api/platforms');
    });

    it('planningAPI.getPlanning hits /api/planning', async () => {
        await makeStore(planningAPI).dispatch(planningAPI.endpoints.getPlanning.initiate());
        expect(calledPath()).toBe('/api/planning');
    });

    it('every slice uses a distinct reducerPath (no accidental collisions)', () => {
        const paths = [genresAPI, seriesAPI, dlcsAPI, statsAPI, platformsAPI, planningAPI].map(
            (api) => api.reducerPath
        );
        expect(new Set(paths).size).toBe(paths.length);
    });
});
