import type { AppConfig } from 'next-intl';

/**
 * Keys of the `gamesLibrary.gamesGenres` message namespace, e.g. "1" | "2" | ...
 * Previously redeclared independently in `GenresSelect.tsx`,
 * `GameGenres.tsx`, and `GenresChart.tsx` — any rename under
 * `gamesLibrary.gamesGenres` in the messages schema required updating all
 * three call sites even though none of them reference each other.
 */
type GamesLibraryMessages = AppConfig['Messages']['gamesLibrary'];

export type GameGenreId = keyof GamesLibraryMessages['gamesGenres'];