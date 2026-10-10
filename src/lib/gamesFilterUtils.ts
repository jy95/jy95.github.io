import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameFilters, GameSort } from '@/types/gamesFilters';

/** Query-string keys owned by the game filters; any other key belongs to the page. */
export const GAME_FILTER_KEYS = ['title', 'platform', 'genres', 'sort', 'releaseDateFrom', 'releaseDateTo'] as const satisfies readonly (keyof GameFilters)[];

// Earliest release in api/games/games.json (1996-10-04). A catalogue regression
// test keeps this small client-side bound in sync without bundling the catalogue.
export const MIN_RELEASE_YEAR = 1996;

export const getMaxReleaseYear = () => new Date().getFullYear();

export function getReleaseYearRange({ 
    releaseDateFrom = MIN_RELEASE_YEAR, 
    releaseDateTo = getMaxReleaseYear()
}: GameFilters): [number, number] {
    return [releaseDateFrom, releaseDateTo];
}

/** The catalogue stores ISO calendar dates. Reject invalid/overflow dates. */
export function releaseYear(date: string | undefined): number | undefined {
    const year = Number(date?.split('-')[0]);
    return Number.isFinite(year) ? year : undefined;
}

const isId = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isSort = (value: unknown): value is GameSort =>
    GAME_SORT_OPTIONS.some(sort => sort === value);

/** Drops invalid ids, removes duplicates and sorts ascending, without mutating the input. */
export const canonicalizeGenres = (genres: readonly number[]): number[] =>
    [...new Set(genres.filter(isId))].sort((a, b) => a - b);


/**
 * Canonical, sparse filters: every empty or invalid field is left out.
 * No `sort` means "keep the API's natural order". The title is kept as typed (spaces included).
 */
export function normalizeGameFilters({ 
    title = '', 
    platform, 
    genres = [], 
    sort, 
    releaseDateFrom = MIN_RELEASE_YEAR, 
    releaseDateTo = getMaxReleaseYear()
}: GameFilters): GameFilters {

    const cleanGenres = canonicalizeGenres(genres);
    const maxYear = getMaxReleaseYear();

    // To prevent input issues when someone tries to be naughty
    const [start, end] = [releaseDateFrom, releaseDateTo].sort();

    // Prepare cleaned payload
    const query: Partial<GameFilters> = {};

    const addIf = <K extends keyof GameFilters>(
        key: K, 
        value: GameFilters[K] | undefined, 
        condition: boolean
    ) => {
        if (condition && value !== undefined) {
            query[key] = value;
        }
    };

    // Add fields if relevant
    addIf("title", title, title.length > 0);
    addIf("platform", platform, isId(platform));
    addIf("genres", cleanGenres, cleanGenres.length > 0);
    addIf("sort", sort, isSort(sort));
    addIf("releaseDateFrom", start, start > MIN_RELEASE_YEAR);
    addIf("releaseDateTo", end, end < maxYear);

    return query;
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

/** Only plain non-negative integers are accepted; anything else becomes undefined and is dropped by normalize. */
const START_WITH_DIGITS_REGEX = /^\d+$/;
const parseId = (value: string | null) => (START_WITH_DIGITS_REGEX.test(value ?? '') ? Number(value) : undefined);

/** Unknown keys and invalid values are ignored; for duplicated scalar keys the first value wins. */
export const searchParamsToFilters = (params: URLSearchParams): GameFilters =>
    normalizeGameFilters({
        title: params.get('title')?.trim(),
        platform: parseId(params.get('platform')),
        genres: params.getAll('genres').map(Number),
        sort: (params.get('sort')?.trim()) as GameSort | undefined,
        releaseDateFrom: parseId(params.get('releaseDateFrom')),
        releaseDateTo: parseId(params.get('releaseDateTo')),
    });
