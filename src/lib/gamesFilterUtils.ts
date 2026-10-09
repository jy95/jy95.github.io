// Types
export interface GameFilters {
  title?: string;
  platform?: number;
  genres?: number[];
  sort?: string;
  releaseDateFrom?: number;
  releaseDateTo?: number;
}

export type SearchParams = Record<string, string>;

// Constants
export const GAME_FILTER_KEYS: (keyof GameFilters)[] = ['title', 'platform', 'genres', 'sort', 'releaseDateFrom', 'releaseDateTo'];
export const GAME_SORT_OPTIONS = ['title', 'rating', 'releaseDate'] as const;
export const MIN_RELEASE_YEAR = 1996;

// Utilities
const isValidId = (v: any): v is number => Number.isInteger(v) && v >= 0;
const parseId = (s: string): number | null => {
  const n = +s;
  return Number.isInteger(n) && n >= 0 ? n : null;
};
const releaseYear = (d: string): number | null => {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d).getUTCFullYear() : null;
};

// Normalization rules
const normalize = new Map<keyof GameFilters, (v: any, max: number) => any>([
  ['title', v => v?.trim() || null],
  ['platform', v => isValidId(v) ? v : null],
  ['genres', v => v?.length ? [...new Set(v.filter(isValidId))].sort((a, b) => a - b) : null],
  ['sort', v => GAME_SORT_OPTIONS.includes(v) ? v : null],
  ['releaseDateFrom', (v, max) => (y => y && y > MIN_RELEASE_YEAR ? y : null)(releaseYear(v))],
  ['releaseDateTo', (v, max) => (y => y && y < max ? y : null)(releaseYear(v))],
]);

// Core functions
export const normalizeGameFilters = (filters: Partial<GameFilters>): GameFilters => {
  const max = new Date().getFullYear();
  return Object.fromEntries(
    GAME_FILTER_KEYS.map(k => [k, normalize.get(k)?.(filters[k], max)]).filter(([, v]) => v !== null)
  ) as GameFilters;
};

export const filtersToSearchParams = (filters: GameFilters): SearchParams =>
  Object.fromEntries(
    Object.entries(filters).map(([k, v]) => [k, k === 'genres' ? v.join(',') : String(v)])
  ) as SearchParams;

export const searchParamsToFilters = (params: SearchParams): GameFilters =>
  Object.fromEntries(
    Object.entries(params)
      .map(([k, v]) => [k, k === 'genres' ? v.split(',').map(parseId).filter(Boolean) : parseId(v)])
      .filter(([k, v]) => k === 'genres' ? v.length : v !== null)
  ) as GameFilters;
