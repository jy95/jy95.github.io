import Fuse from 'fuse.js';
import { getReleaseYearRange, releaseYear } from './gamesFilterUtils';
import { sortGames } from './gamesSort';
import type { GameFilters } from '@/types/gamesFilters';

type BrowsableGame = {
    title: string;
    platform?: number;
    genres?: number[];
    releaseDate?: string;
    duration?: string;
};

/** Shared catalogue filtering, fuzzy title matching and sorting. */
export function browseGames<T extends BrowsableGame>(games: readonly T[], filters: GameFilters = {}): T[] {
    const releaseRange = filters.releaseDateFrom !== undefined || filters.releaseDateTo !== undefined
        ? getReleaseYearRange(filters) : undefined;
    const filtered = games.filter(game => {
        if (filters.platform !== undefined && game.platform !== filters.platform) return false;
        if (filters.genres?.length && !filters.genres.some(id => game.genres?.includes(id))) return false;
        if (releaseRange) {
            const year = releaseYear(game.releaseDate);
            if (year === undefined || year < releaseRange[0] || year > releaseRange[1]) return false;
        }
        return true;
    });
    const results = filters.title
        ? new Fuse(filtered, { keys: ['title'] }).search(filters.title).map(result => result.item)
        : filtered;
    return sortGames(results, filters.sort);
}
