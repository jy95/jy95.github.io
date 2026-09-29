import { describe, it, expect } from 'vitest';
import type { RawGame } from '@/domain/games/types';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import { sortGames } from './gamesSort';

const game = (title: string, extra: Partial<RawGame> = {}): RawGame => ({
    title,
    platform: 1,
    videoId: title,
    ...extra,
});

const games = [
    game('B', { releaseDate: '2010-01-01', duration: '02:00:00' }),
    game('A', { releaseDate: '2020-01-01', duration: '00:00:00' }),
    game('C'),
    game('D', { releaseDate: '2010-01-01', duration: '00:30:00' }),
];

describe('sortGames', () => {
    it('returns a new array preserving input order without a sort', () => {
        const result = sortGames(games);
        expect(result).toEqual(games);
        expect(result).not.toBe(games);
    });

    it.each(GAME_SORT_OPTIONS)('sorts %s without mutating the input', sort => {
        const expected = {
            title_asc: ['A', 'B', 'C', 'D'],
            title_desc: ['D', 'C', 'B', 'A'],
            releaseDate_asc: ['B', 'D', 'A', 'C'],
            releaseDate_desc: ['A', 'B', 'D', 'C'],
            duration_asc: ['D', 'B', 'A', 'C'],
            duration_desc: ['B', 'D', 'A', 'C'],
        };
        const input = Object.freeze([...games]);
        const result = sortGames(input, sort);

        expect(result.map(g => g.title)).toEqual(expected[sort]);
        expect(result).not.toBe(input);
        expect(input).toEqual(games);
    });

    it('compares titles with French collation, ignoring case and accents and sorting numbers naturally', () => {
        const input = [game('Zelda'), game('éclair 10'), game('Eclair 2'), game('Alpha')];
        expect(sortGames(input, 'title_asc').map(g => g.title)).toEqual([
            'Alpha', 'Eclair 2', 'éclair 10', 'Zelda',
        ]);
        expect(sortGames(input, 'title_desc').map(g => g.title)).toEqual([
            'Zelda', 'éclair 10', 'Eclair 2', 'Alpha',
        ]);
    });

    it('breaks equal durations and missing values by title in either direction', () => {
        const input = [
            game('Z', { duration: '01:00:00' }),
            game('B'),
            game('A', { duration: '00:00:00' }),
            game('Y', { duration: '01:00:00' }),
        ];
        expect(sortGames(input, 'duration_asc').map(g => g.title)).toEqual(['Y', 'Z', 'A', 'B']);
        expect(sortGames(input, 'duration_desc').map(g => g.title)).toEqual(['Y', 'Z', 'A', 'B']);
    });

    it('preserves additional fields on raw API entries', () => {
        const input = [{ ...game('B'), genres: [2] }, { ...game('A'), genres: [1] }];
        const result = sortGames(input, 'title_asc');
        expect(result[0]).toBe(input[1]);
        expect(result[0].genres).toEqual([1]);
    });
});
