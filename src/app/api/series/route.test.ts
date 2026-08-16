// src/app/api/series/route.test.ts
import { describe, it, expect, vi } from 'vitest';

const mockSeries = [
    {
        name: 'Batman',
        items: [
            { id: 6, title: 'Batman: Arkham Asylum', playlistId: 'PL_ASYLUM', duration: '05:59:51', platform: 1 },
            { id: 8, title: 'Batman Arkham City', playlistId: 'PL_CITY', duration: '06:47:41', platform: 1 },
        ],
    },
    {
        name: 'God of War',
        items: [
            { id: 41, title: 'God of War III', playlistId: 'PL_GOW3', duration: '06:46:19', platform: 6 },
        ],
    },
];

vi.mock('./series.json', () => ({ default: mockSeries }));

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

describe('GET /api/series', () => {
    it('preserves series names and count', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.map((s: { name: string }) => s.name)).toEqual(['Batman', 'God of War']);
    });

    it('preserves item order and count within a series', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].items).toHaveLength(2);
        expect(data[0].items.map((i: { id: string }) => i.id)).toEqual(['PL_ASYLUM', 'PL_CITY']);
    });

    it('builds a valid playlist card entry for every item', async () => {
        const res = await GET();
        const data = await res.json();
        for (const serie of data) {
            for (const item of serie.items) {
                expect(item.url).toMatch(/^https:\/\/www\.youtube\.com\/playlist\?list=/);
                expect(item.imagePath.startsWith('/covers/')).toBe(true);
            }
        }
    });

    it('handles a series with a single item without dropping it', async () => {
        const res = await GET();
        const data = await res.json();
        const gow = data.find((s: { name: string }) => s.name === 'God of War');
        expect(gow.items).toHaveLength(1);
    });

});
