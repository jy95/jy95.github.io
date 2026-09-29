import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameFilters, GameSort } from '@/types/gamesFilters';

/** Query-string keys owned by the game filters; any other key belongs to the page. */
export const GAME_FILTER_KEYS = ['title', 'platform', 'genres', 'sort'] as const satisfies readonly (keyof GameFilters)[];

const isId = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isSort = (value: unknown): value is GameSort =>
    GAME_SORT_OPTIONS.some(sort => sort === value);

/** Drops invalid ids, removes duplicates and sorts ascending, without mutating the input. */
export const canonicalizeGenres = (genres: readonly number[]): number[] =>
    [...new Set(genres.filter(isId))].sort((a, b) => a - b);

/**
 * Canonical, sparse filters: every empty or invalid field is left out.
 * No `sort` means "keep the API's natural order". The title is kept as typed (spaces included).
 */
export function normalizeGameFilters({ title, platform, genres, sort }: GameFilters): GameFilters {
    const cleanGenres = canonicalizeGenres(genres ?? []);
    return {
        ...(title ? { title } : {}),
        ...(isId(platform) ? { platform } : {}),
        ...(cleanGenres.length ? { genres: cleanGenres } : {}),
        ...(isSort(sort) ? { sort } : {}),
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
    });