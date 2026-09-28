import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameFilters, GameSort } from '@/types/gamesFilters';

const isId = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isSort = (value: unknown): value is GameSort =>
    GAME_SORT_OPTIONS.some(sort => sort === value);

/** Copies, deduplicates, and orders numeric IDs without mutating the input. */
export function canonicalizeGenres(genres: readonly number[]): number[] {
    return [...new Set(genres.filter(isId))].sort((a, b) => a - b);
}

/** Canonical sparse state. No explicit sort is the default (API result order). */
export function normalizeGameFilters(filters: GameFilters): GameFilters {
    const result: GameFilters = {};
    // Preserve nonempty title text, including spaces, for existing search semantics.
    if (typeof filters.title === 'string' && filters.title.length > 0) result.title = filters.title;
    if (isId(filters.platform)) result.platform = filters.platform;
    const genres = canonicalizeGenres(filters.genres ?? []);
    if (genres.length > 0) result.genres = genres;
    if (isSort(filters.sort)) result.sort = filters.sort;
    return result;
}

/** Uses the existing API's repeated selected_genres parameter convention. */
export function filtersToSearchParams(filters: GameFilters): URLSearchParams {
    const normalized = normalizeGameFilters(filters);
    const params = new URLSearchParams();
    if (normalized.title !== undefined) params.set('selected_title', normalized.title);
    if (normalized.platform !== undefined) params.set('selected_platform', String(normalized.platform));
    for (const genre of normalized.genres ?? []) params.append('selected_genres', String(genre));
    if (normalized.sort !== undefined) params.set('sort', normalized.sort);
    return params;
}

function parseId(value: string | null): number | undefined {
    if (value === null || !/^\d+$/.test(value)) return undefined;
    const number = Number(value);
    return isId(number) ? number : undefined;
}

/** Invalid IDs/sorts and unknown keys are ignored; duplicate scalar keys use the first value. */
export function searchParamsToFilters(params: URLSearchParams): GameFilters {
    const sort = params.get('sort');
    return normalizeGameFilters({
        title: params.get('selected_title') ?? undefined,
        platform: parseId(params.get('selected_platform')),
        genres: params.getAll('selected_genres').map(parseId).filter(isId),
        sort: isSort(sort) ? sort : undefined,
    });
}

