import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

// Two categories deliberately share display_order (1) so we can assert the
// id-ascending tiebreak the route falls back to.
vi.mock('./categories.json', () => ({
    default: [
        { id: 1, slug: 'tier_masterpiece', display_order: 1 },
        { id: 7, slug: 'tier_not_evaluated', display_order: 7 },
        { id: 3, slug: 'tier_good', display_order: 3 },
        { id: 2, slug: 'tier_excellent', display_order: 1 },
    ],
}));

import { GET } from './route';

function makeRequest(sort?: string): Request {
    const url = new URL('http://localhost/api/tier-lists/categories');
    if (sort !== undefined) url.searchParams.set('sort', sort);
    return new Request(url.toString());
}

describe('GET /api/tier-lists/categories', () => {
    it('defaults to ascending order when no sort param is given', async () => {
        const res = await GET(makeRequest());
        const data = await res.json();
        expect(data[0]).toBe('tier_masterpiece');
        expect(data[data.length - 1]).toBe('tier_not_evaluated');
    });

    it('sorts descending by display_order when sort=desc', async () => {
        const res = await GET(makeRequest('desc'));
        const data = await res.json();
        expect(data[0]).toBe('tier_not_evaluated');
        expect(data[1]).toBe('tier_good');
    });

    it('breaks a display_order tie using id ascending in asc mode', async () => {
        const res = await GET(makeRequest('asc'));
        const data: string[] = await res.json();
        expect(data.indexOf('tier_masterpiece')).toBeLessThan(data.indexOf('tier_excellent'));
    });

    it('still breaks a display_order tie using id ascending in desc mode', async () => {
        // The route's comparator only flips the primary display_order
        // comparison for desc; the `a.id - b.id` tiebreak is unconditional,
        // so tied categories keep the same relative order in both modes.
        const res = await GET(makeRequest('desc'));
        const data: string[] = await res.json();
        expect(data.indexOf('tier_masterpiece')).toBeLessThan(data.indexOf('tier_excellent'));
    });

    it('treats any unrecognized sort value as ascending', async () => {
        const res = await GET(makeRequest('bogus'));
        const data = await res.json();
        expect(data[0]).toBe('tier_masterpiece');
    });

    it('returns only the slug strings, not full category objects', async () => {
        const res = await GET(makeRequest());
        const data = await res.json();
        expect(data).toHaveLength(4);
        for (const entry of data) {
            expect(typeof entry).toBe('string');
        }
    });

    it('sets a long-lived Cache-Control header', async () => {
        const res = await GET(makeRequest());
        expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    });
});
