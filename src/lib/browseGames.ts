import Fuse from 'fuse.js';
import { getReleaseYearRange, releaseYear } from './gamesFilterUtils';
import { sortGames } from './gamesSort';
import type { GameFilters } from '@/types/gamesFilters';

export type BrowsableGame = {
    title: string;
    platform?: number;
    genres?: number[];
    releaseDate?: string;
    duration?: string;
};

type ReleaseYearRange = ReturnType<typeof getReleaseYearRange>;

export function matchesPlatform(game: BrowsableGame, platform?: number): boolean {
    return platform === undefined || game.platform === platform;
}

export function matchesGenres(game: BrowsableGame, genres?: number[]): boolean {
    if (!genres?.length) return true;
    return genres.some(id => game.genres?.includes(id));
}

function inRange(val: number | undefined, [min, max]: [number, number]) {
    if (!val) return false;
    return val >= min && val <= max;
}

export function matchesReleaseYear(game: BrowsableGame, range?: ReleaseYearRange): boolean {
    // If no range, criteria is true regardless of the game release
    if (!range) return true;
    const year = releaseYear(game.releaseDate);
    return inRange(year, range);
}

export function searchGameTitles<T extends BrowsableGame>(games: T[], title?: string): T[] {
    if (!title) return games;
    return new Fuse(games, { keys: ['title'] }).search(title).map(result => result.item);
}

function releaseRange(filters: GameFilters): ReleaseYearRange | undefined {
    if (filters.releaseDateFrom === undefined && filters.releaseDateTo === undefined) return undefined;
    return getReleaseYearRange(filters);
}

/** Shared catalogue filtering, fuzzy title matching and sorting. */
export function browseGames<T extends BrowsableGame>(games: readonly T[], filters: GameFilters = {}): T[] {
    const range = releaseRange(filters);
    const filtered = games.filter(game => matchesPlatform(game, filters.platform)
        && matchesGenres(game, filters.genres) && matchesReleaseYear(game, range));
    return sortGames(searchGameTitles(filtered, filters.title), filters.sort);
}
