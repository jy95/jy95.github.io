import { describe, it, expect } from 'vitest';
import {
    platformToInt,
    genreToInt,
    identifierKindToDatabaseField,
    turnStringToObj,
    findIdsInTextArea,
    validateFolder,
} from './utils';

describe('platformToInt', () => {
    it('maps known platform names to their numeric id', () => {
        expect(platformToInt('PC')).toBe(1);
        expect(platformToInt('PS3')).toBe(6);
        expect(platformToInt('SCUMMVM')).toBe(7);
    });

    it('falls back to 0 for an unrecognized platform', () => {
        // NOTE: documents the CURRENT (silent-fallback) behavior. This is a
        // known sharp edge for the GitHub-issue automation pipeline: a
        // typo'd platform value silently becomes platform id 0 ("PC")
        // instead of failing the automated task. Flagged as a follow-up —
        // consider making this throw.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(platformToInt('XBOX' as any)).toBe(0);
    });
});

describe('genreToInt', () => {
    it('maps known genre names to their numeric id', () => {
        expect(genreToInt('Action')).toBe(1);
        expect(genreToInt('Misc')).toBe(20);
    });

    it('falls back to 0 for an unrecognized genre', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(genreToInt('Roguelike' as any)).toBe(0);
    });
});

describe('identifierKindToDatabaseField', () => {
    it('maps "Video" to "videoId"', () => {
        expect(identifierKindToDatabaseField('Video')).toBe('videoId');
    });

    it('maps "Playlist" to "playlistId"', () => {
        expect(identifierKindToDatabaseField('Playlist')).toBe('playlistId');
    });
});

describe('findIdsInTextArea', () => {
    it('splits on newlines and trims whitespace', () => {
        expect(findIdsInTextArea('  ID_1  \nID_2\n  ID_3')).toEqual(['ID_1', 'ID_2', 'ID_3']);
    });

    it('drops empty lines', () => {
        expect(findIdsInTextArea('ID_1\n\n\nID_2\n')).toEqual(['ID_1', 'ID_2']);
    });

    it('returns an empty array for undefined input', () => {
        expect(findIdsInTextArea(undefined)).toEqual([]);
    });

    it('returns an empty array for an empty string', () => {
        expect(findIdsInTextArea('')).toEqual([]);
    });
});

describe('turnStringToObj', () => {
    it('parses plain JSON payloads unchanged', () => {
        expect(turnStringToObj('{"title":"Some Game"}')).toEqual({ title: 'Some Game' });
    });

    it('collapses single-element arrays for known "transform" keys', () => {
        expect(turnStringToObj('{"platform":["PC"]}')).toEqual({ platform: 'PC' });
    });

    it('drops empty arrays for known "transform" keys entirely', () => {
        expect(turnStringToObj('{"category":[]}')).toEqual({});
    });

    it('leaves multi-element arrays for known "transform" keys untouched', () => {
        expect(turnStringToObj('{"folder":["covers","testscovers"]}')).toEqual({
            folder: ['covers', 'testscovers'],
        });
    });

    it('does not transform arrays under unrelated keys', () => {
        expect(turnStringToObj('{"genres":["Action"]}')).toEqual({ genres: ['Action'] });
    });
});

describe('validateFolder', () => {
    it('accepts every known folder name', () => {
        expect(() => validateFolder('covers')).not.toThrow();
        expect(() => validateFolder('testscovers')).not.toThrow();
        expect(() => validateFolder('backlogcovers')).not.toThrow();
    });

    it('throws for an unknown folder name', () => {
        expect(() => validateFolder('../../etc')).toThrow(/Invalid folder name/);
    });

    it('throws for an empty folder name', () => {
        expect(() => validateFolder('')).toThrow(/Invalid folder name/);
    });
});