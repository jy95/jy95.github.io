import type { GameSort } from "./gameSorting";

export type EntityGamesDetailLabels = {
    back: string;
    sort: string;
    loadMore: string;
    options: Record<GameSort, string>;
};
