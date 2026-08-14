import { describe, it, expect, vi } from 'vitest';
import type { CardGame } from '@/redux/sharedDefintion';
import type { planningEntry } from './route';

// Mock the JSON data source so we control which entries have `endAt` and
// which don't — the real fixture happens to have `endAt` on every row,
// which would leave the PENDING branch of enhanceGameItem untested.
vi.mock('./planning.json', () => ({
    default: [
        {
            id: 208,
            title: 'Recorded Game',
            platform: 1,
            playlistId: 'PL123',
            availableAt: '2024-01-01',
            endAt: '2024-01-10',
            releaseDate: '2020-01-01',
            duration: '01:00:00',
            genres: [1, 2],
        },
        {
            id: 209,
            title: 'Pending Game',
            platform: 2,
            videoId: 'abc123',
            availableAt: '2025-01-01',
            releaseDate: '2021-01-01',
            duration: '02:00:00',
            genres: [3],
        },
    ],
}));

import { GET } from './route';

async function getData(): Promise<planningEntry[]> {
    const response = await GET();
    return response.json();
}

describe('GET /api/planning', () => {
    it('marks an entry that has an endAt field as RECORDED', async () => {
        const data = await getData();
        const entry = data.find((e) => e.id === 'PL123')!;
        expect(entry.status).toBe('RECORDED');
    });

    it('marks an entry with no endAt field as PENDING', async () => {
        const data = await getData();
        const entry = data.find((e) => e.id === 'abc123')!;
        expect(entry.status).toBe('PENDING');
    });

    it('builds a playlist card entry (url, url_type) from a playlistId', async () => {
        const data = await getData();
        const entry = data.find((e) => e.id === 'PL123')!;
        expect(entry.url_type).toBe('PLAYLIST');
        expect(entry.url).toBe('https://www.youtube.com/playlist?list=PL123');
        expect(entry.imagePath).toBe('/covers/PL123/cover.webp');
    });

    it('builds a video card entry (url, url_type) from a videoId', async () => {
        const data = await getData();
        const entry = data.find((e) => e.id === 'abc123')!;
        expect(entry.url_type).toBe('VIDEO');
        expect(entry.url).toBe('https://www.youtube.com/watch?v=abc123');
        expect(entry.imagePath).toBe('/covers/abc123/cover.webp');
    });

    it('preserves genres, duration, and releaseDate on the enhanced entry', async () => {
        const data = await getData();
        const entry = data.find((e) => e.id === 'PL123')!;
        expect(entry.genres).toEqual([1, 2]);
        expect(entry.duration).toBe('01:00:00');
        expect(entry.releaseDate).toBe('2020-01-01');
    });

    it('outputs the youtube identifier as id, not the raw numeric database id', async () => {
        const data = await getData();
        // The raw fixture rows had numeric ids 208/209; enhanceGameItem
        // discards them in favor of buildCardEntry's playlistId/videoId.
        expect(data.map((e) => e.id)).toEqual(['PL123', 'abc123']);
    });

    it('sets a long-lived Cache-Control header', async () => {
        const response = await GET();
        expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
    });

    it('returns one entry per source row', async () => {
        const data = await getData();
        expect(data).toHaveLength(2);
    });

    it('preserves platform and availableAt fields', async () => {
        const data = await getData();
        const playlistEntry = data.find((e) => e.id === 'PL123')!;
        const videoEntry = data.find((e) => e.id === 'abc123')!;
        
        expect(playlistEntry.platform).toBe(1);
        expect(playlistEntry.availableAt).toBe('2024-01-01');
        expect(videoEntry.platform).toBe(2);
        expect(videoEntry.availableAt).toBe('2025-01-01');
    });
});
