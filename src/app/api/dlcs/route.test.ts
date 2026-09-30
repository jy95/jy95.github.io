// src/app/api/dlcs/route.test.ts
import { describe, it, expect, vi } from "vitest";

const mockDlcs = [
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
];

vi.mock('./dlcs.json', () => ({ default: mockDlcs }));

import { GET } from './route';

describe('GET /api/dlcs', () => {
    it('maps game_title to name for each group', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.map((g: { name: string }) => g.name)).toEqual([
            'Batman Arkham City',
            'Batman: Arkham Knight',
        ]);
    });

    it('returns one output entry per input group', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data).toHaveLength(mockDlcs.length);
        expect(data.map((group: { id: string }) => group.id)).toEqual(mockDlcs.map((group) => group.id));
    });

    it('preserves the number and order of dlcs within a group', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[1].items).toHaveLength(2);
        expect(data[1].items.map((i: { title: string }) => i.title)).toEqual([
            'Harley Quinn Story Pack',
            'Playlist DLC',
        ]);
    });

    it('builds a card entry (url, url_type, imagePath under /covers) for every dlc item', async () => {
        const res = await GET();
        const data = await res.json();
        for (const group of data) {
            for (const item of group.items) {
                expect(item.imagePath.startsWith('/covers/')).toBe(true);
                expect(['PLAYLIST', 'VIDEO']).toContain(item.url_type);
            }
        }
    });

    it('preserves stored DLC fields while replacing numeric IDs with canonical identities', async () => {
        const data = await (await GET()).json();
        expect(data[0].items[0]).toEqual({
            ...mockDlcs[0].dlcs[0], id: 'XGEgNG67oXA',
            url: 'https://www.youtube.com/watch?v=XGEgNG67oXA', url_type: 'VIDEO',
            imagePath: '/covers/XGEgNG67oXA/cover.webp',
        });
        expect(data[1].items[1]).toEqual({
            ...mockDlcs[1].dlcs[1], id: 'dlc-playlist',
            url: 'https://www.youtube.com/playlist?list=dlc-playlist', url_type: 'PLAYLIST',
            imagePath: '/covers/dlc-playlist/dlc.webp',
        });
    });

    it('retains public cache headers', async () => {
        expect((await GET()).headers.get('Cache-Control')).toBe('public, max-age=86400, must-revalidate');
    });

});
