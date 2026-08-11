import { describe, it, expect } from 'vitest';
import { extractGameCardProps, buildCardEntry } from './sharedDefintion';
import type { RawGame } from './sharedDefintion';

describe('extractGameCardProps', () => {
    it('builds a playlist URL and PLAYLIST type when playlistId is present', () => {
        const game = { title: 'Some Game', platform: 1, playlistId: 'PL123' } as unknown as RawGame;
        expect(extractGameCardProps(game)).toEqual({
            id: 'PL123',
            url: 'https://www.youtube.com/playlist?list=PL123',
            url_type: 'PLAYLIST',
        });
    });

    it('builds a video URL and VIDEO type when videoId is present', () => {
        const game = { title: 'Some Game', platform: 1, videoId: 'abc123' } as unknown as RawGame;
        expect(extractGameCardProps(game)).toEqual({
            id: 'abc123',
            url: 'https://www.youtube.com/watch?v=abc123',
            url_type: 'VIDEO',
        });
    });
});

describe('buildCardEntry', () => {
    it('defaults the cover file to cover.webp', () => {
        const game = { title: 'Some Game', platform: 1, videoId: 'abc123' } as unknown as RawGame;
        expect(buildCardEntry(game, '/covers')).toEqual({
            id: 'abc123',
            url: 'https://www.youtube.com/watch?v=abc123',
            url_type: 'VIDEO',
            imagePath: '/covers/abc123/cover.webp',
        });
    });

    it('respects a custom coverFile when provided', () => {
        const game = {
            title: 'Some Game',
            platform: 1,
            playlistId: 'PL999',
            coverFile: 'alt-cover.jpg',
        } as unknown as RawGame;
        expect(buildCardEntry(game, '/testscovers').imagePath).toBe(
            '/testscovers/PL999/alt-cover.jpg',
        );
    });

    it('scopes the image path to the given covers base path', () => {
        const game = { title: 'X', platform: 1, videoId: 'v1' } as unknown as RawGame;
        expect(buildCardEntry(game, '/backlogcovers').imagePath).toBe('/backlogcovers/v1/cover.webp');
        expect(buildCardEntry(game, '/covers').imagePath).toBe('/covers/v1/cover.webp');
    });
});