import { describe, it, expect, vi } from 'vitest';

vi.mock('./series.json', () => ({ default: [
    { id: 2, name: 'Batman', items: [{ id: 6, title: 'Arkham', playlistId: 'PL_ASYLUM', platform: 1 }] },
    { id: 10, name: 'Batman', items: [{ id: 8, title: 'City', videoId: 'CITY', platform: 1 }] },
    { id: 3, name: 'Zelda', items: [] },
] }));
vi.mock('../tier-lists/games/games.json', () => ({ default: { tier_good: [{ id: 'PL_ASYLUM' }] } }));

import { GET } from './route';
import { GET as detail } from './[id]/route';
const request = (query = '') => new Request(`https://example.com/api/series${query}`);

describe('Series APIs', () => {
    it('returns summaries and caches successful responses', async () => {
        const response = await GET(request());
        expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
        const body = await response.json();
        expect(body).toMatchObject({ page: 1, pageSize: 12, total_items: 3, total_pages: 1 });
        expect(body.items[0]).toEqual({ id: 10, name: 'Batman', gamesCount: 1, imagePath: '/seriescovers/10/cover.webp' });
    });
    it('filters and sorts before pagination', async () => {
        const body = await (await GET(request('?filter=BAT&pageSize=1&page=2'))).json();
        expect(body).toMatchObject({ total_items: 2, total_pages: 2, items: [{ id: 2 }] });
    });
    it.each([['nameAsc', [10, 2, 3]], ['nameDesc', [3, 10, 2]], ['countAsc', [3, 10, 2]], ['countDesc', [10, 2, 3]]])('sorts %s', async (sort, ids) => {
        const body = await (await GET(request(`?sort=${sort}`))).json();
        expect(body.items.map((item: { id: number }) => item.id)).toEqual(ids);
    });
    it.each(['?page=-1&pageSize=0&sort=invalid', '?page=1.5&pageSize=no', '?page=9007199254740992&pageSize=-2'])('defaults invalid parameters %s', async query => {
        expect(await (await GET(request(query))).json()).toMatchObject({ page: 1, pageSize: 12 });
    });
    it('preserves empty and out-of-range metadata and clamps page size', async () => {
        expect(await (await GET(request('?filter=missing'))).json()).toMatchObject({ items: [], total_items: 0, total_pages: 0 });
        expect(await (await GET(request('?page=5&pageSize=999'))).json()).toMatchObject({ items: [], page: 5, pageSize: 100, total_pages: 1 });
    });
    it('constructs cards and derives tiers from YouTube ids rather than database ids', async () => {
        const body = await (await detail(request(), { params: Promise.resolve({ id: '2' }) })).json();
        expect(body).toMatchObject({ imagePath: '/seriescovers/2/cover.webp', items: [{ id: 'PL_ASYLUM', tierCategory: 'tier_good', imagePath: '/covers/PL_ASYLUM/cover.webp', url_type: 'PLAYLIST' }] });
        const video = await (await detail(request(), { params: Promise.resolve({ id: '10' }) })).json();
        expect(video.items[0]).toMatchObject({ id: 'CITY', url_type: 'VIDEO', tierCategory: 'tier_not_evaluated' });
    });
    it('returns 404 for unknown ids', async () => {
        expect((await detail(request(), { params: Promise.resolve({ id: 'missing' }) })).status).toBe(404);
    });
});
