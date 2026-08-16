// src/app/api/dlcs/route.test.ts
import { describe, it, expect, vi } from 'vitest';

const mockDlcs = [
    {
        game_title: 'Batman Arkham City',
        dlcs: [
            { id: 203, title: "Harley Quinn's Revenge", videoId: 'XGEgNG67oXA', duration: '01:12:35', platform: 1 },
        ],
    },
    {
        game_title: 'Batman: Arkham Knight',
        dlcs: [
            { id: 193, title: 'Harley Quinn Story Pack', videoId: 'ln_Pnp1zOQw', duration: '00:15:00', platform: 1 },
            { id: 192, title: 'Red Hood Story Pack', videoId: 'FO8cYct2Bkw', duration: '00:14:17', platform: 1 },
        ],
    },
];

vi.mock('./dlcs.json', () => ({ default: mockDlcs }));

vi.mock('@/redux/sharedDefintion', () => ({
    buildCardEntry: (game: { videoId?: string; playlistId?: string }, base: string) => {
        const id = game.videoId ?? game.playlistId!;
        return {
            id,
            url: game.videoId
                ? `https://www.youtube.com/watch?v=${id}`
                : `https://www.youtube.com/playlist?list=${id}`,
            url_type: game.videoId ? 'VIDEO' : 'PLAYLIST',
            imagePath: `${base}/${id}/cover.webp`,
        };
    },
}));

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
    });

    it('preserves the number and order of dlcs within a group', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[1].items).toHaveLength(2);
        expect(data[1].items.map((i: { title: string }) => i.title)).toEqual([
            'Harley Quinn Story Pack',
            'Red Hood Story Pack',
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

});
