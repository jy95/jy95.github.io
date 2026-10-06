import { timeToSeconds } from "@/domain/games";
import { scoreCandidate } from "./scoreCandidate";
import { titleBigrams } from "./titleSimilarity";
import { buildCandidateIndex } from "./candidateIndex";
import { DEFAULT_WEIGHTS } from "./weights";
import { compareRelatedGames } from "./compareRelatedGames";

import type { CardGame } from "@/domain/games";
import type { CandidateIndex } from "./candidateIndex";
import type { RelatedGameResult, RelatedGamesOptions } from "./types";
import type { ScoringContext } from "./scorers/types";

const DEFAULT_LIMIT = 3;

function buildScoringContext(
    target: CardGame,
    options: RelatedGamesOptions,
    candidateBigrams: ReadonlyMap<string, string[]>
): ScoringContext {
    const { seriesMap = {}, tierMap = {}, weights } = options;

    return {
        target,
        targetSeries: seriesMap[target.id],
        targetGenres: new Set(target.genres ?? []),
        targetDurationSeconds: target.duration ? timeToSeconds(target.duration) : undefined,
        targetTitleBigrams: titleBigrams(target.title),
        seriesMap,
        tierMap,
        weights: { ...DEFAULT_WEIGHTS, ...weights, tier: { ...DEFAULT_WEIGHTS.tier, ...weights?.tier } },
        candidateBigrams,
    };
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
    // Fractions are truncated; NaN and negative limits yield no results.
    const limit = Math.trunc(options.limit ?? DEFAULT_LIMIT) || 0;

    const ranked = index.candidates
        .filter(candidate => candidate.id !== target.id)
        .flatMap(candidate => scoreCandidate(candidate, context) ?? [])
        .sort(compareRelatedGames);

    // Sorted best-first, so the first occurrence of an id is its best result.
    const results: RelatedGameResult[] = [];
    const seen = new Set<string>();
    for (const result of ranked) {
        if (results.length >= limit) break;
        if (seen.has(result.game.id)) continue;

        seen.add(result.game.id);
        results.push(result);
    }
    return results;
}
