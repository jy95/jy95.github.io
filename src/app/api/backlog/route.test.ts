import { describe, it, expect, vi } from 'vitest';

const mockBacklog = [
    { id: 0, title: 'Game A', platform: 1, hltb_main: '10:00:00' },
    { id: 1, title: 'Game B', notes: 'some notes' },
];

vi.mock('./backlog.json', () => ({ default: mockBacklog }));

import { GET } from './route';

describe('GET /api/backlog', () => {
    it('returns one entry per source row', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data).toHaveLength(2);
    });

    it('assigns sequential string ids based on array index', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].id).toBe('0');
        expect(data[1].id).toBe('1');
    });

    it('derives imagePath from the assigned id', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].imagePath).toBe('/backlogcovers/0/cover.webp');
        expect(data[1].imagePath).toBe('/backlogcovers/1/cover.webp');
    });

    it('preserves all other fields verbatim', async () => {
        const res = await GET();
        const data = await res.json();
        expect(data[0].title).toBe('Game A');
        expect(data[0].platform).toBe(1);
        expect(data[0].hltb_main).toBe('10:00:00');
        expect(data[1].notes).toBe('some notes');
    });

    it('does not carry over a raw numeric id from the source row', async () => {
        const res = await GET();
        const data = await res.json();
        // Source rows have numeric "id" fields; the route converts them to strings.
        expect(data[0].id).toBe('0');
        expect(data[1].id).toBe('1');
    });

});
