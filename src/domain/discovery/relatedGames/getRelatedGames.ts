import { timeToSeconds } from "@/domain/games";
import { scoreCandidate } from "./scoreCandidate";
import { titleBigrams } from "./titleSimilarity";
import { buildCandidateIndex } from "./candidateIndex";
import { DEFAULT_WEIGHTS } from "./weights";
import { compareRelatedGames } from "./compareRelatedGames";

import type { CardGame } from "@/domain/games";
import type { CandidateIndex } from "./candidateIndex";
import type { RelatedGameResult, RelatedGamesOptions, RelatedGamesWeights } from "./types";
import type { ScoringContext } from "./scorers/types";

const DEFAULT_LIMIT = 3;

function mergeWeights(overrides: RelatedGamesOptions["weights"] = {}): RelatedGamesWeights {
    return {
        ...DEFAULT_WEIGHTS,
        ...overrides,
        tier: { ...DEFAULT_WEIGHTS.tier, ...overrides.tier },
    };
}

function buildScoringContext(
    target: CardGame,
    options: RelatedGamesOptions,
    candidateBigrams: ReadonlyMap<string, string[]>
): ScoringContext {
    const { seriesMap = {}, tierMap = {} } = options;

    return {
        target,
        targetSeries: seriesMap[target.id],
        targetGenres: new Set(target.genres ?? []),
        targetDurationSeconds: target.duration ? timeToSeconds(target.duration) : undefined,
        targetTitleBigrams: titleBigrams(target.title),
        seriesMap,
        tierMap,
        weights: mergeWeights(options.weights),
        candidateBigrams,
    };
}

/** NaN and negative limits mean "no results"; fractions are truncated. */
const normalizeLimit = (limit: number) => Math.max(0, Math.trunc(limit) || 0);

/** When an id appears several times, only its best-scoring result is kept (first one wins ties). */
function keepBestPerId(results: RelatedGameResult[]): RelatedGameResult[] {
    const byId = new Map<string, RelatedGameResult>();

    for (const result of results) {
        const existing = byId.get(result.game.id);
        if (!existing || compareRelatedGames(result, existing) < 0) {
            byId.set(result.game.id, result);
        }
    }
    return [...byId.values()];
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

    const scored = index.candidates
        .filter((candidate) => candidate.id !== target.id)
        .map((candidate) => scoreCandidate(candidate, context))
        .filter((result): result is RelatedGameResult => result !== undefined);

    return keepBestPerId(scored)
        .sort(compareRelatedGames)
        .slice(0, normalizeLimit(options.limit ?? DEFAULT_LIMIT));
}
