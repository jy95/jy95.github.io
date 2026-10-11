import { describe, it, expect, vi } from "vitest";
import type { DlcListResponse } from "@/domain/dlcs/types";

const mockDlcs = vi.hoisted(() => [
    {
        id: 'PLRfhDHeBTBJ6RBqsJ0WYOOaL5wohZTbxw',
        game_title: 'Batman Arkham City',
        dlcs: [
            { id: 203, title: "Harley Quinn's Revenge", videoId: 'XGEgNG67oXA', duration: '01:12:35', platform: 1 },
        ],
    },
    {
        id: 'PLRfhDHeBTBJ6POjMkqqeCliq5jrCWagcg',
        game_title: 'Batman: Arkham Knight',
        dlcs: [
            { id: 193, title: 'Harley Quinn Story Pack', videoId: 'ln_Pnp1zOQw', duration: '00:15:00', platform: 1 },
            { id: 192, title: 'Playlist DLC', playlistId: 'dlc-playlist', duration: '00:14:17', platform: 1, coverFile: 'dlc.webp' },
        ],
    },
]);

vi.mock('./dlcs.json', () => ({ default: mockDlcs }));

import { GET } from './route';
import { GET as detailGET } from './[id]/route';

async function list(query = ""): Promise<DlcListResponse> {
    return (await GET(new Request(`http://localhost/api/dlcs?${query}`))).json();
}

const detail = (id: string) => detailGET(new Request('http://localhost/api/dlcs'), { params: Promise.resolve({ id }) });

describe('DLC endpoints', () => {
    it('paginates summary cards without DLC items using parent covers', async () => {
        const first = await list('pageSize=1');
        const second = await list('pageSize=1&page=2');
        expect(first).toMatchObject({ total_items: 2, total_pages: 2, pageSize: 1, page: 1 });
        expect(first.items).toEqual([{
            id: mockDlcs[0].id, name: mockDlcs[0].game_title,
            imagePath: `/covers/${mockDlcs[0].id}/cover.webp`, dlcsCount: 1,
        }]);
        expect(second.items[0]).toEqual({
            id: mockDlcs[1].id, name: mockDlcs[1].game_title,
            imagePath: `/covers/${mockDlcs[1].id}/cover.webp`, dlcsCount: 2,
        });
        expect((await list('pageSize=1&page=3')).items).toEqual([]);
    });

    it('filters case-insensitively before pagination and trims input', async () => {
        const result = await list('filter=%20KNIGHT%20&pageSize=1');
        expect(result).toMatchObject({ total_items: 1, total_pages: 1 });
        expect(result.items.map(group => group.id)).toEqual([mockDlcs[1].id]);
        expect((await list('filter=missing')).total_items).toBe(0);
    });

    it.each([
        ['nameAsc', [0, 1]], ['nameDesc', [1, 0]],
        ['countAsc', [0, 1]], ['countDesc', [1, 0]],
    ])('sorts by %s before pagination', async (sort, order) => {
        const result = await list(`sort=${sort}`);
        expect(result.items.map(group => group.id)).toEqual(order.map(index => mockDlcs[index].id));
        expect((await list(`sort=${sort}&pageSize=1`)).items[0]).toEqual(result.items[0]);
    });

    it('defaults invalid parameters and caps page size', async () => {
        expect(await list('page=-1&pageSize=bad&sort=invalid')).toEqual(await list());
        expect(await list('page=1.5&pageSize=0')).toEqual(await list());
        expect((await list('pageSize=1000')).pageSize).toBe(100);
    });

    it('converts video and playlist detail items using canonical identities', async () => {
        const first = await (await detail(mockDlcs[0].id)).json();
        expect(first).toMatchObject({ id: mockDlcs[0].id, name: mockDlcs[0].game_title, dlcsCount: 1 });
        expect(first.items[0]).toEqual({
            ...mockDlcs[0].dlcs[0], id: 'XGEgNG67oXA',
            url: 'https://www.youtube.com/watch?v=XGEgNG67oXA', url_type: 'VIDEO',
            imagePath: '/covers/XGEgNG67oXA/cover.webp',
        });
        const second = await (await detail(mockDlcs[1].id)).json();
        expect(second.items).toHaveLength(2);
        expect(second.items[1]).toEqual({
            ...mockDlcs[1].dlcs[1], id: 'dlc-playlist',
            url: 'https://www.youtube.com/playlist?list=dlc-playlist', url_type: 'PLAYLIST',
            imagePath: '/covers/dlc-playlist/dlc.webp',
        });
    });

    it('returns 404 for an unknown parent', async () => {
        const response = await detail('unknown');
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: 'DLC group not found' });
    });

    it('retains public cache headers on list and detail responses', async () => {
        for (const response of [await GET(new Request('http://localhost/api/dlcs')), await detail(mockDlcs[0].id)]) {
            expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400, must-revalidate');
        }
    });
});
