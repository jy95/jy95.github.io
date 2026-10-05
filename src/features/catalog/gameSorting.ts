import { timeToSeconds } from "@/domain/games";
import categories from "@/app/api/tier-lists/categories/categories.json";
import type { CardGame } from "@/domain/games";

export type TieredCardGame = CardGame & { tierCategory?: string | null };

export const SORT_OPTIONS = ["titleAsc", "titleDesc", "durationAsc", "durationDesc", "tierAsc", "tierDesc"] as const;
export type GameSort = typeof SORT_OPTIONS[number];

const tierOrder = new Map(categories.map(category => [category.slug, category.display_order]));
const tierRank = (game: TieredCardGame) => tierOrder.get(game.tierCategory ?? "") ?? Number.MAX_SAFE_INTEGER;
type Comparator = (first: TieredCardGame, second: TieredCardGame) => number;
const comparators: Record<GameSort, Comparator> = {
    titleAsc: (a, b) => a.title.localeCompare(b.title),
    titleDesc: (a, b) => b.title.localeCompare(a.title),
    durationAsc: (a, b) => timeToSeconds(a.duration) - timeToSeconds(b.duration),
    durationDesc: (a, b) => timeToSeconds(b.duration) - timeToSeconds(a.duration),
    tierAsc: (a, b) => tierRank(a) - tierRank(b),
    tierDesc: (a, b) => tierRank(b) - tierRank(a),
};

export function compareGames(first: TieredCardGame, second: TieredCardGame, sort: GameSort): number {
    return comparators[sort](first, second) || first.title.localeCompare(second.title) || first.id.localeCompare(second.id);
}
