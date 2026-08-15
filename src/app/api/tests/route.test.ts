import { describe, it, expect, vi } from 'vitest';

const mockTests = [
    { title: 'A', videoId: 'v1', platform: 1 },
    { title: 'B', videoId: 'v2', platform: 1 },
    { title: 'C', videoId: 'v3', platform: 1 },
    { title: 'D', videoId: 'v4', platform: 1 },
];

vi.mock('./tests.json', () => ({
    default: mockTests,
}));

vi.mock('@/redux/sharedDefintion', () => ({
    buildCardEntry: (game: any, base: string) => ({
        id: game.videoId,
        url: `https://www.youtube.com/watch?v=${game.videoId}`,
        url_type: 'VIDEO',
        imagePath: `${base}/${game.videoId}/cover.webp`,
    }),
}));

import { GET } from './route';

function makeRequest(params?: Record<string, string>): Request {
    const url = new URL('http://localhost/api/tests');
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
    }
    return new Request(url.toString());
}

describe('GET /api/tests', () => {
    it('returns every item when no limit is given (defaults to -1, meaning "all")', async () => {
        const res = await GET(makeRequest());
        const data = await res.json();
        expect(data.items).toHaveLength(4);
        expect(data.limit).toBe(-1);
        expect(data.offset).toBe(0);
    });

    it('total_items always reflects the full dataset size, not the sliced result', async () => {
        const res = await GET(makeRequest({ limit: '2' }));
        const data = await res.json();
        expect(data.total_items).toBe(4);
        expect(data.items).toHaveLength(2);
    });

    it('slices using gamesData.slice(offset, limit) verbatim (limit is an end index, not a count)', async () => {
        // With offset=1 and limit=3 this yields slice(1, 3) => indices 1 and 2 (B, C),
        // not "3 items starting at offset 1" as the param names might suggest.
        const res = await GET(makeRequest({ limit: '3', offset: '1' }));
        const data = await res.json();
        expect(data.items.map((i: any) => i.id)).toEqual(['v2', 'v3']);
    });

    it('defaults offset to 0 when omitted', async () => {
        const res = await GET(makeRequest({ limit: '2' }));
        const data = await res.json();
        expect(data.offset).toBe(0);
        expect(data.items.map((i: any) => i.id)).toEqual(['v1', 'v2']);
    });

    it('returns an empty items array when offset is beyond the dataset', async () => {
        const res = await GET(makeRequest({ limit: '10', offset: '10' }));
        const data = await res.json();
        expect(data.items).toEqual([]);
        expect(data.total_items).toBe(4);
    });

    it('echoes back the requested limit and offset values unchanged', async () => {
        const res = await GET(makeRequest({ limit: '5', offset: '2' }));
        const data = await res.json();
        expect(data.limit).toBe(5);
        expect(data.offset).toBe(2);
    });

    it('builds a valid VIDEO card entry under /testscovers for every item', async () => {
        const res = await GET(makeRequest());
        const data = await res.json();
        for (const item of data.items) {
            expect(item.url_type).toBe('VIDEO');
            expect(item.imagePath.startsWith('/testscovers/')).toBe(true);
            expect(item.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
        }
    });

    it('sets a long-lived Cache-Control header', async () => {
        const res = await GET(makeRequest());
        expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    });
});
