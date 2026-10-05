import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameFilters, GameSort } from '@/types/gamesFilters';

/** Query-string keys owned by the game filters; any other key belongs to the page. */
export const GAME_FILTER_KEYS = ['title', 'platform', 'genres', 'sort', 'releaseDateFrom', 'releaseDateTo'] as const satisfies readonly (keyof GameFilters)[];

// Earliest release in api/games/games.json (1996-10-04). A catalogue regression
// test keeps this small client-side bound in sync without bundling the catalogue.
export const MIN_RELEASE_YEAR = 1996;

export const getMaxReleaseYear = () => new Date().getFullYear();

export function getReleaseYearRange(filters: GameFilters): [number, number] {
    return [filters.releaseDateFrom ?? MIN_RELEASE_YEAR, filters.releaseDateTo ?? getMaxReleaseYear()];
}

/** The catalogue stores ISO calendar dates. Reject invalid/overflow dates. */
export function releaseYear(date: string | undefined): number | undefined {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;

    const parsed = new Date(date);
    const isRealDate = Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    return isRealDate ? parsed.getUTCFullYear() : undefined;
}

const isId = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isSort = (value: unknown): value is GameSort =>
    GAME_SORT_OPTIONS.some(sort => sort === value);

/** Drops invalid ids, removes duplicates and sorts ascending, without mutating the input. */
export const canonicalizeGenres = (genres: readonly number[]): number[] =>
    [...new Set(genres.filter(isId))].sort((a, b) => a - b);

/** Clamps both bounds to the catalogue range, falls back to the full range and orders them. */
function normalizeYearRange(from: unknown, to: unknown, maxYear: number): [number, number] {
    const clamp = (value: unknown, fallback: number) => {
        if (!isId(value) || value === 0) return fallback;
        return Math.max(MIN_RELEASE_YEAR, Math.min(maxYear, value));
    };
    const start = clamp(from, MIN_RELEASE_YEAR);
    const end = clamp(to, maxYear);
    return [Math.min(start, end), Math.max(start, end)];
}

/**
 * Canonical, sparse filters: every empty or invalid field is left out.
 * No `sort` means "keep the API's natural order". The title is kept as typed (spaces included).
 */
export function normalizeGameFilters(filters: GameFilters): GameFilters {
    const { title, platform, genres, sort, releaseDateFrom, releaseDateTo } = filters;
    const maxYear = getMaxReleaseYear();
    const cleanGenres = canonicalizeGenres(genres ?? []);
    const [start, end] = normalizeYearRange(releaseDateFrom, releaseDateTo, maxYear);

    const normalized: GameFilters = {};
    if (title) normalized.title = title;
    if (isId(platform)) normalized.platform = platform;
    if (cleanGenres.length > 0) normalized.genres = cleanGenres;
    if (isSort(sort)) normalized.sort = sort;
    if (start > MIN_RELEASE_YEAR) normalized.releaseDateFrom = start;
    if (end < maxYear) normalized.releaseDateTo = end;
    return normalized;
}

/** Scalars become one param each; genres become one repeated `genres` param per id. */
export function filtersToSearchParams(filters: GameFilters): URLSearchParams {
    const { genres = [], ...scalars } = normalizeGameFilters(filters);
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(scalars)) params.append(key, String(value));
    for (const genre of genres) params.append('genres', String(genre));
    return params;
}

/** Only plain non-negative integers are accepted; anything else becomes NaN and is dropped by normalize. */
const parseId = (value: string | null) => (/^\d+$/.test(value ?? '') ? Number(value) : NaN);

/** Unknown keys and invalid values are ignored; for duplicated scalar keys the first value wins. */
export const searchParamsToFilters = (params: URLSearchParams): GameFilters =>
    normalizeGameFilters({
        title: params.get('title') ?? undefined,
        platform: parseId(params.get('platform')),
        genres: params.getAll('genres').map(parseId),
        sort: (params.get('sort') ?? undefined) as GameSort | undefined,
        releaseDateFrom: parseId(params.get('releaseDateFrom')),
        releaseDateTo: parseId(params.get('releaseDateTo')),
    });
