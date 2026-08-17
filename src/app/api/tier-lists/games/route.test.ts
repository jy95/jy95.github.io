import { describe, expect, it, vi } from 'vitest';

const mockGamesTierList = {
    tier_masterpiece: [{ id: 'game-1', title: 'Game One' }],
    tier_average: [{ id: 'game-2', title: 'Game Two' }],
};

vi.mock('./games.json', () => ({
    default: mockGamesTierList,
}));

import { GET } from './route';

describe('GET /api/tier-lists/games', () => {
    it('returns the games tier-list payload unchanged', async () => {
        const response = await GET();

        expect(await response.json()).toEqual(mockGamesTierList);
    });

    it('preserves each category and its game order', async () => {
        const response = await GET();
        const data = await response.json();

        expect(Object.keys(data)).toEqual(['tier_masterpiece', 'tier_average']);
        expect(data.tier_masterpiece.map((game: { id: string }) => game.id)).toEqual(['game-1']);
        expect(data.tier_average.map((game: { id: string }) => game.id)).toEqual(['game-2']);
    });

    it('sets a long-lived Cache-Control header', async () => {
        const response = await GET();

        expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
        expect(response.headers.get('Cache-Control')).toContain('must-revalidate');
    });
});
