import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';

const fetchMock = stubRtkFetch();
vi.stubGlobal('fetch', fetchMock);

const { companiesAPI } = await import('./companiesAPI');

function makeStore() {
    return configureStore({
        reducer: { [companiesAPI.reducerPath]: companiesAPI.reducer },
        middleware: (getDefault) => getDefault().concat(companiesAPI.middleware),
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('companiesAPI.getCompanies', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse([]));
    });

    it('hits /api/companies', async () => {
        await makeStore().dispatch(companiesAPI.endpoints.getCompanies.initiate());
        expect(calledUrl(fetchMock).pathname).toBe('/api/companies');
    });

    it('returns the payload verbatim through the query', async () => {
        const payload = [
            {
                id: 1,
                name: 'Capcom',
                imagePath: '/companies/1/cover.webp',
                developerGames: [{ id: 'g1', title: 'Game One' }],
                publisherGames: [],
            },
        ];
        fetchMock.mockImplementation(async () => jsonResponse(payload));

        const result = await makeStore().dispatch(companiesAPI.endpoints.getCompanies.initiate());
        expect(result.data).toEqual(payload);
    });

    it('uses the shared RTK Query reducer path', () => {
        expect(companiesAPI.reducerPath).toBe('api');
    });
});