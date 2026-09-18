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

type CandidateScoringContext = Parameters<typeof scoreCandidate>[1];

function buildScoringContext(
    target: CardGame,
    options: RelatedGamesOptions
): CandidateScoringContext {
    const { seriesMap = {}, tierMap = {} } = options;
    const weights: RelatedGamesWeights = {
        ...DEFAULT_WEIGHTS,
        ...options.weights,
        tier: { ...DEFAULT_WEIGHTS.tier, ...options.weights?.tier },
    };

    return {
        target,
        targetSeries: seriesMap[target.id],
        targetGenres: new Set(target.genres ?? []),
        targetDurationSeconds: target.duration ? timeToSeconds(target.duration) : undefined,
        targetTitleBigrams: titleBigrams(target.title),
        seriesMap,
        tierMap,
        weights,
    };
}

function rankCandidates(
    target: CardGame,
    candidates: CardGame[],
    context: CandidateScoringContext
): RelatedGameResult[] {
    const byId = new Map<string, RelatedGameResult>();
    for (const candidate of candidates) {
        if (candidate.id === target.id) continue;
        const result = scoreCandidate(candidate, context);
        if (!result) continue;

        const existing = byId.get(candidate.id);
        if (!existing || compareRelatedGames(result, existing) < 0) {
            byId.set(candidate.id, result);
        }
    }

    return [...byId.values()].sort(compareRelatedGames);
}

/**
 * Returns deterministic related-game results.
 * Scores are internal ranking data. Callers must not expose them to users.
 */
export function getRelatedGames(
    target: CardGame,
    candidates: CardGame[],
    options: RelatedGamesOptions = {}
): RelatedGameResult[] {
    return rankCandidates(target, candidates, buildScoringContext(target, options)).slice(
        0,
        options.limit ?? 3
    );
}
