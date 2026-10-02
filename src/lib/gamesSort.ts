import { isMeaningfulDuration, timeToSeconds } from '@/domain/games/duration';
import type { RawGame } from '@/domain/games/types';
import type { GameSort } from '@/types/gamesFilters';

type SortableGame = Pick<RawGame, 'title' | 'releaseDate' | 'duration'>;

const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

const text = (a: string, b: string) => collator.compare(a, b);
const num = (a: number, b: number) => a - b;

/** Builds a comparator; games with no value always go last, whatever the direction. */
const by = <V>(get: (game: SortableGame) => V | undefined, compare: (a: V, b: V) => number, sign: 1 | -1) =>
    (a: SortableGame, b: SortableGame) => {
        const x = get(a);
        const y = get(b);

        if (x === undefined || y === undefined) {
            return x === y ? 0 : x === undefined ? 1 : -1;
        }

        return compare(x, y) * sign;
    };

const title = (game: SortableGame) => game.title;
const releaseDate = (game: SortableGame) => game.releaseDate;
const seconds = (game: SortableGame) =>
    isMeaningfulDuration(game.duration) ? timeToSeconds(game.duration) : undefined;

const COMPARATORS = {
    title_asc: by(title, text, 1),
    title_desc: by(title, text, -1),
    releaseDate_asc: by(releaseDate, text, 1),
    releaseDate_desc: by(releaseDate, text, -1),
    duration_asc: by(seconds, num, 1),
    duration_desc: by(seconds, num, -1),
} satisfies Record<GameSort, (a: SortableGame, b: SortableGame) => number>;

/** Returns a new array. Without `sort`, the input order is kept (e.g. Fuse relevance). */
export function sortGames<T extends SortableGame>(games: readonly T[], sort?: GameSort): T[] {
    if (!sort) return [...games];

    const compare = COMPARATORS[sort];
    return [...games].sort((a, b) => compare(a, b) || text(a.title, b.title));
}
