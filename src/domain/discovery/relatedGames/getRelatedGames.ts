import { timeToSeconds } from "@/domain/games";
import { compareRelatedGames } from "./compareRelatedGames";
import { scoreCandidate } from "./scoreCandidate";
import { titleBigrams } from "./titleSimilarity";
import { DEFAULT_WEIGHTS } from "./weights";

import type { CardGame } from "@/domain/games";
import type {
    RelatedGameResult,
    RelatedGamesOptions,
    RelatedGamesWeights,
} from "./types";

/**
 * Returns deterministic related-game results.
 * Scores are internal ranking data. Callers must not expose them to users.
 */
export function getRelatedGames(
    target: CardGame,
    candidates: CardGame[],
    options: RelatedGamesOptions = {}
): RelatedGameResult[] {
    const { seriesMap = {}, tierMap = {}, limit = 3 } = options;
    const weights: RelatedGamesWeights = {
        ...DEFAULT_WEIGHTS,
        ...options.weights,
        tier: { ...DEFAULT_WEIGHTS.tier, ...options.weights?.tier },
    };
    const targetSeries = seriesMap[target.id];

    const targetGenres = new Set(target.genres ?? []);
    const targetDurationSeconds = target.duration ? timeToSeconds(target.duration) : undefined;
    const targetTitleBigrams = titleBigrams(target.title);
    const scoringContext = {
        target,
        targetSeries,
        targetGenres,
        targetDurationSeconds,
        targetTitleBigrams,
        seriesMap,
        tierMap,
        weights,
    };

    const byId = new Map<string, RelatedGameResult>();
    for (const candidate of candidates) {
        if (candidate.id === target.id) continue;
        const result = scoreCandidate(candidate, scoringContext);
        if (!result) continue;

        const existing = byId.get(candidate.id);
        if (!existing || compareRelatedGames(result, existing) < 0) {
            byId.set(candidate.id, result);
        }
    }

    return [...byId.values()].sort(compareRelatedGames).slice(0, limit);
}
