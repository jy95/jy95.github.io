import { describe, it, expect, vi } from 'vitest';

const mockStats = {
    platforms: [{ id: 1, platform: 'PC', total: 5, total_available: 5, total_unavailable: 0 }],
    genres: [{ id: 1, genre: 'Action', total: 3, total_available: 3, total_unavailable: 0 }],
    general: {
        channel_start_date: '2014-04-15T17:35:16+00:00',
        games: { total: 5, total_available: 5, total_unavailable: 0 },
        dlcs: { total: 0, total_available: 0, total_unavailable: 0 },
        duration: {
            total: { hours: 1, minutes: 0, seconds: 0 },
            total_available: { hours: 1, minutes: 0, seconds: 0 },
            total_unavailable: { hours: 0, minutes: 0, seconds: 0 },
        },
    },
};

vi.mock('./stats.json', () => ({ default: mockStats }));

import { GET } from './route';

describe('GET /api/stats', () => {
    it('returns the stats payload verbatim', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data).toEqual(mockStats);
    });

    it('preserves the general.games sub-object exactly', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.general.games).toEqual(mockStats.general.games);
    });

    it('preserves the platforms and genres arrays', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.platforms).toEqual(mockStats.platforms);
        expect(data.genres).toEqual(mockStats.genres);
    });
});
