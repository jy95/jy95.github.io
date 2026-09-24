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

const response = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('companiesAPI', () => {
    beforeEach(() => {
        fetchMock.mockReset().mockImplementation(async () => response({ items: [], page: 1, total_pages: 1 }));
    });

    it('requests the first role-filtered page and preserves metadata', async () => {
        const payload = { items: [{ id: 1, name: 'Both' }], page: 1, total_pages: 2 };
        fetchMock.mockImplementation(async () => response(payload));
        const result = await makeStore().dispatch(companiesAPI.endpoints.getCompanies.initiate({ role: 'publisher', pageSize: 12 }));
        expect(calledUrl(fetchMock).pathname).toBe('/api/companies');
        expect(calledUrl(fetchMock).searchParams.get('role')).toBe('publisher');
        expect(calledUrl(fetchMock).searchParams.get('page')).toBe('1');
        expect(result.data?.pages).toEqual([payload]);
    });

    it('fetches the next page using metadata', async () => {
        fetchMock.mockImplementation(async (input: Request) => response({ items: [], total_pages: 2, page: Number(new URL(input.url).searchParams.get('page')) }));
        const store = makeStore();
        await store.dispatch(companiesAPI.endpoints.getCompanies.initiate({ role: 'all', pageSize: 12 }));
        await store.dispatch(companiesAPI.endpoints.getCompanies.initiate({ role: 'all', pageSize: 12 }, { direction: 'forward', forceRefetch: true }));
        expect(calledUrl(fetchMock, 1).searchParams.get('page')).toBe('2');
    });

    it('queries a single company directly', async () => {
        const payload = { id: 1, name: 'Both', developerGames: [], publisherGames: [] };
        fetchMock.mockImplementation(async () => response(payload));
        const result = await makeStore().dispatch(companiesAPI.endpoints.getCompany.initiate('1'));
        expect(calledUrl(fetchMock).pathname).toBe('/api/companies/1');
        expect(result.data).toEqual(payload);
        expect(companiesAPI.reducerPath).toBe('api');
    });
});
