import { describe, it, expect } from 'vitest';
import { extractGameCardProps, buildPlaylistUrl, buildVideoUrl } from './youtube';
import { buildCardEntry, buildCardGame } from './card';
import { isMeaningfulDuration } from './duration';
import type { RawGame, BasicGame } from './types';

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

describe('buildPlaylistUrl / buildVideoUrl', () => {
    it('produces the canonical playlist URL shape', () => {
        expect(buildPlaylistUrl('PL999')).toBe('https://www.youtube.com/playlist?list=PL999');
    });

    it('produces the canonical video URL shape', () => {
        expect(buildVideoUrl('v1')).toBe('https://www.youtube.com/watch?v=v1');
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

describe('buildCardGame', () => {
    it('merges the raw game fields with the derived card entry fields', () => {
        const game = {
            id: 999, // raw source id, expected to be overridden by the youtube id
            title: 'Beyond Good & Evil',
            platform: 6,
            genres: [1, 2],
            releaseDate: '2003-11-14',
            duration: '05:52:22',
            playlistId: 'PL7GRN3EnqBEvfki5uAKiw5Z',
        } as unknown as BasicGame;

        expect(buildCardGame(game, '/covers')).toEqual({
            id: 'PL7GRN3EnqBEvfki5uAKiw5Z',
            title: 'Beyond Good & Evil',
            platform: 6,
            genres: [1, 2],
            releaseDate: '2003-11-14',
            duration: '05:52:22',
            playlistId: 'PL7GRN3EnqBEvfki5uAKiw5Z',
            url: 'https://www.youtube.com/playlist?list=PL7GRN3EnqBEvfki5uAKiw5Z',
            url_type: 'PLAYLIST',
            imagePath: '/covers/PL7GRN3EnqBEvfki5uAKiw5Z/cover.webp',
        });
    });

    it('builds a VIDEO card game from a videoId source', () => {
        const game = { title: 'Portal', platform: 6, videoId: 'IwBRxURrIDM' } as unknown as BasicGame;
        const result = buildCardGame(game, '/covers');
        expect(result.url_type).toBe('VIDEO');
        expect(result.url).toBe('https://www.youtube.com/watch?v=IwBRxURrIDM');
        expect(result.id).toBe('IwBRxURrIDM');
    });
});

describe('isMeaningfulDuration', () => {
    it('is true for a real duration', () => {
        expect(isMeaningfulDuration('01:30:00')).toBe(true);
    });

    it('is false for the "00:00:00" sentinel', () => {
        expect(isMeaningfulDuration('00:00:00')).toBe(false);
    });

    it('is false for undefined', () => {
        expect(isMeaningfulDuration(undefined)).toBe(false);
    });
});