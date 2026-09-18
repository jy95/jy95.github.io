import type { RelatedGameResult } from "./types";

export function compareRelatedGames(a: RelatedGameResult, b: RelatedGameResult): number {
    if (b.score !== a.score) return b.score - a.score;
    const titleDifference = compareText(a.game.title, b.game.title);
    return titleDifference || compareText(a.game.id, b.game.id);
}

function compareText(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}
