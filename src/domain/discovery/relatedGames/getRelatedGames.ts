import { timeToSeconds } from "@/domain/games";
import { compareRelatedGames } from "./compareRelatedGames";
import { scoreCandidate } from "./scoreCandidate";
import { titleBigrams } from "./titleSimilarity";
import { buildCandidateIndex } from "./candidateIndex";
import { DEFAULT_WEIGHTS } from "./weights";

import type { CardGame } from "@/domain/games";
import type { CandidateIndex } from "./candidateIndex";
import type { RelatedGameResult, RelatedGamesOptions, RelatedGamesWeights } from "./types";
import type { ScoringContext } from "./scorers/types";

function buildScoringContext(
    target: CardGame,
    options: RelatedGamesOptions,
    candidateBigrams: ReadonlyMap<string, string[]>
): ScoringContext {
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
        candidateBigrams,
    };
}

function rankCandidates(
    target: CardGame,
    candidates: CardGame[],
    context: ScoringContext
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
 *
 * `candidates` accepts either a plain array — bigrams are then computed
 * once, internally, for this single call — or a pre-built `CandidateIndex`
 * (see candidateIndex.ts), whose bigrams are computed once up front and
 * reused. Callers scoring many targets against the same candidate pool
 * (e.g. the build-time extractor) should always pass a pre-built index.
 *
 * Scores are internal ranking data. Callers must not expose them to users.
 */
export function getRelatedGames(
    target: CardGame,
    candidates: CardGame[] | CandidateIndex,
    options: RelatedGamesOptions = {}
): RelatedGameResult[] {
    const index = Array.isArray(candidates) ? buildCandidateIndex(candidates) : candidates;
    const context = buildScoringContext(target, options, index.bigramsById);
    return rankCandidates(target, index.candidates, context).slice(0, options.limit ?? 3);
}