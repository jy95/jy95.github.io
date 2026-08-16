import { describe, it, expect, vi } from 'vitest';

const mockPlatforms = [
    { id: 1, name: 'PC' },
    { id: 6, name: 'PS3' },
];

vi.mock('./platforms.json', () => ({ default: mockPlatforms }));

import { GET } from './route';

describe('GET /api/platforms', () => {
    it('returns the platforms list verbatim', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data).toEqual(mockPlatforms);
    });

    it('preserves the source ordering', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.map((p: { name: string }) => p.name)).toEqual(['PC', 'PS3']);
    });

});
