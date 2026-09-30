/** Explicit sorts; undefined preserves the API's existing result order. */
export const GAME_SORT_OPTIONS = [
    'title_asc', 'title_desc', 'releaseDate_desc', 'releaseDate_asc',
    'duration_asc', 'duration_desc',
] as const;

export type GameSort = typeof GAME_SORT_OPTIONS[number];

/** Empty/absent fields mean no restriction. Platform and genres are numeric IDs. */
export interface GameFilters {
    title?: string;
    platform?: number;
    genres?: number[];
    releaseDateFrom?: number;
    releaseDateTo?: number;
    sort?: GameSort;
}
