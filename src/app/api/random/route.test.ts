import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./identifiers.json', () => ({
    default: [
        { playlistId: 'PL_A' },
        { videoId: 'VID_B' },
    ],
}));

import { GET } from './route';

describe('GET /api/random', () => {
    let randomSpy: ReturnType<typeof vi.spyOn> | undefined;

    afterEach(() => {
        randomSpy?.mockRestore();
        randomSpy = undefined;
    });

    it('returns type PLAYLIST and the playlistId when a playlist entry is picked', async () => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0); // -> index 0
        const res = await GET();
        expect(await res.json()).toEqual({ identifier: 'PL_A', type: 'PLAYLIST' });
    });

    it('returns type VIDEO and the videoId when a video entry is picked', async () => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9); // -> index 1
        const res = await GET();
        expect(await res.json()).toEqual({ identifier: 'VID_B', type: 'VIDEO' });
    });

    it('never returns an undefined identifier regardless of which entry is picked', async () => {
        for (const rand of [0, 0.25, 0.5, 0.75, 0.999]) {
            randomSpy = vi.spyOn(Math, 'random').mockReturnValue(rand);
            const res = await GET();
            const data = await res.json();
            expect(data.identifier).toBeTruthy();
            expect(['PLAYLIST', 'VIDEO']).toContain(data.type);
            randomSpy.mockRestore();
        }
    });

    it('picks strictly within bounds (never index === array length)', async () => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999999);
        const res = await GET();
        const data = await res.json();
        // With a 2-item fixture, the highest valid pick is index 1 (VID_B).
        expect(data.identifier).toBe('VID_B');
    });
});
