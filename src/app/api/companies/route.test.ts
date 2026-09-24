import { describe, it, expect, vi } from 'vitest';

const mockCompanies = [
    { id: 1, name: 'Both', developerItems: [{ id: 1, title: 'A', playlistId: 'one', tierCategory: 'tier_good' }], publisherItems: [{ id: 1, title: 'A', playlistId: 'one' }] },
    { id: 2, name: 'Developer only', developerItems: [{ id: 2, title: 'B', playlistId: 'two' }], publisherItems: [] },
    { id: 3, name: 'Publisher only', developerItems: [], publisherItems: [{ id: 3, title: 'C', videoId: 'three' }] },
    { id: 4, name: 'Another publisher', developerItems: [], publisherItems: [{ id: 4, title: 'D', videoId: 'four' }] },
];

vi.mock('./companies.json', () => ({ default: mockCompanies }));
vi.mock('@/domain/games', () => ({
    buildCardEntry: (game: { videoId?: string; playlistId?: string }, base: string) => {
        const id = game.videoId ?? game.playlistId;
        return { id, url: `https://example.com/${id}`, imagePath: `${base}/${id}/cover.webp`, url_type: 'VIDEO' };
    },
}));

import { GET } from './route';
import { GET as getDetail } from './[id]/route';

const request = (query = '') => new Request(`https://example.com/api/companies${query}`);

describe('GET /api/companies', () => {
    it('returns summaries with unique game counts, but no full game lists', async () => {
        const response = await GET(request('?pageSize=2'));
        const body = await response.json();
        expect(body).toMatchObject({ page: 1, pageSize: 2, total_items: 4, total_pages: 2 });
        expect(body.items[0]).toEqual({ id: 1, name: 'Both', imagePath: '/companies/1/cover.webp', developerCount: 1, publisherCount: 1, gamesCount: 1 });
        expect(body.items[0]).not.toHaveProperty('developerGames');
        expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
    });

    it('filters before slicing, so publisher pages have no empty slots', async () => {
        const first = await (await GET(request('?role=publisher&page=1&pageSize=2'))).json();
        const second = await (await GET(request('?role=publisher&page=2&pageSize=2'))).json();
        expect(first.items.map((company: { id: number }) => company.id)).toEqual([1, 3]);
        expect(second.items.map((company: { id: number }) => company.id)).toEqual([4]);
        expect(first.total_items).toBe(3);
        expect(first.total_pages).toBe(2);
        const developers = await (await GET(request('?role=developer&pageSize=1&page=2'))).json();
        expect(developers.items.map((company: { id: number }) => company.id)).toEqual([2]);
    });

    it('bounds invalid page inputs', async () => {
        const body = await (await GET(request('?page=bad&pageSize=-1'))).json();
        expect(body).toMatchObject({ page: 1, pageSize: 12 });
    });
});

describe('GET /api/companies/[id]', () => {
    it('returns full games including tier and card fields for the requested company', async () => {
        const response = await getDetail(request(), { params: Promise.resolve({ id: '1' }) });
        const body = await response.json();
        expect(body).toMatchObject({ name: 'Both', imagePath: '/companies/1/cover.webp' });
        expect(body.developerGames[0]).toMatchObject({ id: 'one', tierCategory: 'tier_good', imagePath: '/covers/one/cover.webp' });
        expect(body.publisherGames).toHaveLength(1);
    });

    it('returns 404 for an unknown company', async () => {
        expect((await getDetail(request(), { params: Promise.resolve({ id: '999' }) })).status).toBe(404);
    });

    it('assigns the not-evaluated tier to games missing a stored category', async () => {
        const body = await (await getDetail(request(), { params: Promise.resolve({ id: '2' }) })).json();
        expect(body.developerGames[0].tierCategory).toBe('tier_not_evaluated');
    });
});
