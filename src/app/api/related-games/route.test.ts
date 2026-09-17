import { describe, it, expect, vi } from 'vitest';

const mockRelatedGames = {
    abc123: [
        {
            id: 'def456',
            title: 'Related Game',
            imagePath: '/covers/def456/cover.webp',
            url: 'https://www.youtube.com/watch?v=def456',
            url_type: 'VIDEO',
            reason: 'series',
        },
    ],
};

vi.mock('./related-games.json', () => ({ default: mockRelatedGames }));

import { GET } from './route';

describe('GET /api/related-games', () => {
    it('returns the related-games map verbatim', async () => {
        const res = await GET();
        expect(await res.json()).toEqual(mockRelatedGames);
    });

    it('sets a long-lived Cache-Control header', async () => {
        const res = await GET();
        expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    });
});