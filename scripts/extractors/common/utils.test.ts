import { describe, it, expect } from 'vitest';
import { stringifyJSON, normaliazeDuration } from './utils';

describe('stringifyJSON', () => {
    it('produces tab-indented JSON', () => {
        const result = stringifyJSON({ a: 1, b: 2 });
        expect(result).toBe('{\n\t"a": 1,\n\t"b": 2\n}');
    });

    it('drops keys with a null value', () => {
        const result = stringifyJSON({ a: 1, b: null, c: 3 });
        expect(JSON.parse(result)).toEqual({ a: 1, c: 3 });
    });

    it('parses a stringified JSON object value into a real nested object', () => {
        const result = stringifyJSON({ genres: '[1,2,3]' });
        expect(JSON.parse(result)).toEqual({ genres: [1, 2, 3] });
    });

    it('parses a stringified JSON array value into a real nested array', () => {
        const result = stringifyJSON({ list: '["a","b"]' });
        expect(JSON.parse(result)).toEqual({ list: ['a', 'b'] });
    });

    it('leaves a plain (non-JSON-looking) string untouched', () => {
        const result = stringifyJSON({ title: 'Splinter Cell HD' });
        expect(JSON.parse(result)).toEqual({ title: 'Splinter Cell HD' });
    });

    it('recurses through arrays of objects, applying the same rules to each item', () => {
        const result = stringifyJSON([
            { id: 1, genres: '[1,2]', notes: null },
            { id: 2, genres: '[]', notes: 'kept' },
        ]);
        expect(JSON.parse(result)).toEqual([
            { id: 1, genres: [1, 2] },
            { id: 2, genres: [], notes: 'kept' },
        ]);
    });

    it('round-trips a deeply nested structure without losing non-null fields', () => {
        const input = {
            general: {
                games: { total: 5, total_available: 3, total_unavailable: 2 },
                nullable: null,
            },
        };
        const result = stringifyJSON(input);
        expect(JSON.parse(result)).toEqual({
            general: {
                games: { total: 5, total_available: 3, total_unavailable: 2 },
            },
        });
    });
});

describe('normaliazeDuration', () => {
    it('returns the same values when already normalized', () => {
        expect(normaliazeDuration({ hours: 1, minutes: 30, seconds: 15 })).toEqual({
            hours: 1,
            minutes: 30,
            seconds: 15,
        });
    });

    it('carries seconds over 60 into minutes', () => {
        expect(normaliazeDuration({ hours: 0, minutes: 0, seconds: 125 })).toEqual({
            hours: 0,
            minutes: 2,
            seconds: 5,
        });
    });

    it('carries minutes over 60 into hours', () => {
        expect(normaliazeDuration({ hours: 0, minutes: 125, seconds: 0 })).toEqual({
            hours: 2,
            minutes: 5,
            seconds: 0,
        });
    });

    it('carries seconds all the way through minutes into hours', () => {
        expect(normaliazeDuration({ hours: 0, minutes: 59, seconds: 3661 })).toEqual({
            hours: 2,
            minutes: 1,
            seconds: 1,
        });
    });

    it('handles an all-zero duration', () => {
        expect(normaliazeDuration({ hours: 0, minutes: 0, seconds: 0 })).toEqual({
            hours: 0,
            minutes: 0,
            seconds: 0,
        });
    });

    it('handles large hour values without truncating them', () => {
        expect(normaliazeDuration({ hours: 1000, minutes: 0, seconds: 0 })).toEqual({
            hours: 1000,
            minutes: 0,
            seconds: 0,
        });
    });
});