import { describe, it, expect, vi } from 'vitest';

const mockGenres = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
];

vi.mock('./genres.json', () => ({ default: mockGenres }));

import { GET } from './route';

describe('GET /api/genres', () => {
    it('returns the genres list verbatim', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data).toEqual(mockGenres);
    });

    it('preserves the source ordering', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data.map((g: { name: string }) => g.name)).toEqual(['Action', 'Adventure']);
    });

});
