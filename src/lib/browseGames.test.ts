import { describe, expect, it } from 'vitest';
import { browseGames, matchesGenres, matchesPlatform, matchesReleaseYear, searchGameTitles, type BrowsableGame } from './browseGames';

const games = [
    { id: 'a', title: 'Alpha Quest', platform: 0, genres: [1, 2], releaseDate: '2000-01-01', duration: '02:00:00' },
    { id: 'b', title: 'Alpha Quests', platform: 1, genres: [2], releaseDate: '2001-01-01', duration: '01:00:00' },
    { id: 'c', title: 'Zelda', platform: 0, genres: [3], releaseDate: '2002-01-01' },
    { id: 'd', title: 'Unknown' }
];
const ids = (items: { id: string }[]) => items.map(game => game.id);

describe('catalogue predicates', () => {
    it('matches exact platforms including zero and allows missing metadata without a filter', () => {
        expect(matchesPlatform(games[0], 0)).toBe(true);
        expect(matchesPlatform(games[3], 0)).toBe(false);
        expect(matchesPlatform(games[3])).toBe(true);
        expect(ids(browseGames(games, { platform: 0 }))).toEqual(['a', 'c']);
    });
    it('accepts any requested genre and empty filters', () => {
        expect(matchesGenres(games[0], [3, 2])).toBe(true);
        expect(matchesGenres(games[3], [2])).toBe(false);
        expect(matchesGenres(games[3], [])).toBe(true);
        expect(ids(browseGames(games, { genres: [2, 3] }))).toEqual(['a', 'b', 'c']);
    });
    it('uses inclusive year bounds and excludes missing or invalid dates only for active ranges', () => {
        expect(matchesReleaseYear(games[0], [2000, 2001])).toBe(true);
        expect(matchesReleaseYear(games[1], [2000, 2001])).toBe(true);
        expect(matchesReleaseYear(games[3], [2000, 2001])).toBe(false);
        expect(ids(browseGames(games, { releaseDateFrom: 2000, releaseDateTo: 2001 }))).toEqual(['a', 'b']);
        expect(ids(browseGames(games, { releaseDateTo: 2000 }))).toEqual(['a']);
        expect(ids(browseGames(games, { releaseDateFrom: 2002 }))).toEqual(['c']);
    });
});

it('combines filters, fuzzy title matching, and sorting while preserving generic fields', () => {
    const filtered = browseGames(games, { platform: 0, genres: [2], releaseDateFrom: 2000, releaseDateTo: 2001, title: 'Alpa Quest', sort: 'title_desc' });
    expect(ids(filtered)).toEqual(['a']);
    expect(filtered[0].id).toBe('a');
    expect(ids(browseGames(games, { title: 'Alpha Quest', sort: 'duration_asc' }))).toEqual(['b', 'a']);
});
