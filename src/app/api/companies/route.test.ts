import { describe, it, expect, vi } from 'vitest';

const mockCompanies = [
    {
        id: 1,
        name: 'Capcom',
        developerItems: [
            { id: 6, title: 'Batman: Arkham Asylum', playlistId: 'PL_ASYLUM', duration: '05:59:51', platform: 1 },
        ],
        publisherItems: [
            { id: 8, title: 'Batman Arkham City', playlistId: 'PL_CITY', duration: '06:47:41', platform: 1 },
        ],
    },
    {
        id: 2,
        name: 'Insomniac Games',
        developerItems: [
            { id: 41, title: 'God of War III', playlistId: 'PL_GOW3', duration: '06:46:19', platform: 6 },
        ],
        publisherItems: [],
    },
];

vi.mock('./companies.json', () => ({ default: mockCompanies }));

vi.mock('@/domain/games', () => ({
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

describe('GET /api/companies', () => {
    it('preserves company names and count', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.map((c: { name: string }) => c.name)).toEqual(['Capcom', 'Insomniac Games']);
    });

    it('derives imagePath from the company id under /companies', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].imagePath).toBe('/companies/1/cover.webp');
        expect(data[1].imagePath).toBe('/companies/2/cover.webp');
    });

    it('builds valid card entries for developer games', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].developerGames).toHaveLength(1);
        expect(data[0].developerGames[0].url).toMatch(/^https:\/\/www\.youtube\.com\/playlist\?list=/);
        expect(data[0].developerGames[0].imagePath.startsWith('/covers/')).toBe(true);
    });

    it('builds valid card entries for publisher games', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].publisherGames).toHaveLength(1);
        expect(data[0].publisherGames[0].id).toBe('PL_CITY');
    });

    it('handles a company with no publisher games (empty array, not omitted)', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[1].publisherGames).toEqual([]);
        expect(data[1].developerGames).toHaveLength(1);
    });

    it('sets a long-lived Cache-Control header', async () => {
        const res = await GET();
        expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    });
});