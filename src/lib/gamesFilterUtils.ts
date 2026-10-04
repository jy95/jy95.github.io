import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameFilters, GameSort } from '@/types/gamesFilters';

/** Query-string keys owned by the game filters; any other key belongs to the page. */
export const GAME_FILTER_KEYS = [
    'title', 
    'platform', 
    'genres', 
    'sort', 
    'releaseDateFrom', 
    'releaseDateTo'
] as const satisfies readonly (keyof GameFilters)[];

// Earliest release in api/games/games.json (1996-10-04). A catalogue regression
// test keeps this small client-side bound in sync without bundling the catalogue.
export const MIN_RELEASE_YEAR = 1996;

export const getMaxReleaseYear = () => new Date().getFullYear();

export function getReleaseYearRange(filters: GameFilters): [number, number] {
    return [
        filters.releaseDateFrom ?? MIN_RELEASE_YEAR, 
        filters.releaseDateTo ?? getMaxReleaseYear()
    ];
}

/** The catalogue stores ISO calendar dates. Reject invalid/overflow dates. */
export function releaseYear(date: string | undefined): number | undefined {
    const year = date?.match(/^\d+/)?.[0];
    return year ? Number(year) : undefined;
}

const isId = (value: unknown): value is number =>
    Number.isSafeInteger(value);

const isSort = (value: unknown): value is GameSort =>
    GAME_SORT_OPTIONS.some(sort => sort === value);

/** Drops invalid ids, removes duplicates and sorts ascending, without mutating the input. */
export const canonicalizeGenres = (genres: readonly number[]): number[] =>
    [...new Set(genres.filter(isId))].sort((a, b) => a - b);

const buildFilterEntry = <K extends keyof GameFilters>(
    key: K,
    value: GameFilters[K],
    condition: boolean
): Partial<GameFilters> => condition ? { [key]: value } : {};

/**
 * Canonical, sparse filters: every empty or invalid field is left out.
 * No `sort` means "keep the API's natural order". The title is kept as typed (spaces included).
 */
export function normalizeGameFilters({ title, platform, genres, sort, releaseDateFrom, releaseDateTo }: GameFilters): GameFilters {
    const cleanGenres = canonicalizeGenres(genres ?? []);

    // Get current max year and define year clamping utility
    const maxYear = getMaxReleaseYear();
    const clampYear = (value: unknown, fallback: number) =>
        isId(value) && value > 0 ? Math.max(MIN_RELEASE_YEAR, Math.min(maxYear, value)) : fallback;

    // Process release years
    const from = clampYear(releaseDateFrom, MIN_RELEASE_YEAR);
    const to = clampYear(releaseDateTo, maxYear);
    const [start, end] = [
        Math.min(from, to), 
        Math.max(from, to)
    ];

    // Build the normalized filters object
    return {
        ...buildFilterEntry('title', title, !!title),
        ...buildFilterEntry('platform', platform, isId(platform)),
        ...buildFilterEntry('genres', cleanGenres, cleanGenres.length > 0),
        ...buildFilterEntry('sort', sort, isSort(sort)),
        ...buildFilterEntry('releaseDateFrom', start, start > MIN_RELEASE_YEAR),
        ...buildFilterEntry('releaseDateTo', end, end < maxYear)
    };
}

/** Scalars become one param each; genres become one repeated `genres` param per id. */
export function filtersToSearchParams(filters: GameFilters): URLSearchParams {
    const { genres = [], ...scalars } = normalizeGameFilters(filters);
    const params = new URLSearchParams(
        Object.entries(scalars).map(([key, value]) => [key, String(value)])
    );
    genres.forEach(genre => {
        params.append('genres', String(genre));
    });
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
