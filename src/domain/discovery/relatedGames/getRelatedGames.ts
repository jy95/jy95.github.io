import { timeToSeconds } from "@/domain/games";
import { diceCoefficient, titleBigrams } from "./titleSimilarity";
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

    const byId = new Map<string, RelatedGameResult>();
    for (const candidate of candidates) {
        if (candidate.id === target.id) continue;
        const result = scoreCandidate(candidate);
        if (!result) continue;

        const existing = byId.get(candidate.id);
        if (!existing || compareCandidates(result, existing) < 0) {
            byId.set(candidate.id, result);
        }
    }

    return [...byId.values()].sort(compareCandidates).slice(0, limit);

    function compareCandidates(a: RelatedGameResult, b: RelatedGameResult): number {
        if (b.score !== a.score) return b.score - a.score;
        const titleDifference = compareText(a.game.title, b.game.title);
        return titleDifference || compareText(a.game.id, b.game.id);
    }

    function scoreCandidate(candidate: CardGame): RelatedGameResult | undefined {
        const candidateSeries = seriesMap[candidate.id];
        let score = weights.tier[tierMap[candidate.id]] ?? weights.tier.tier_not_evaluated;
        let hasRelation = false;

        if (targetSeries && candidateSeries && targetSeries.id === candidateSeries.id) {
            const distance = Math.abs(targetSeries.order - candidateSeries.order);
            score += weights.series;
            // A game cannot be its own recommendation. A zero distance is still
            // handled safely if imported series data contains duplicate positions.
            score += weights.adjacentSeries / Math.max(1, distance);
            hasRelation = true;
        }

        if (hasAllGenres(targetGenres, candidate.genres)) {
            score += weights.genres + targetGenres.size * weights.genre;
            hasRelation = true;
        }

        if (target.platform !== undefined && candidate.platform === target.platform) {
            score += weights.platform;
            hasRelation = true;
        }

        const titleSimilarity = diceCoefficient(targetTitleBigrams, titleBigrams(candidate.title));
        if (titleSimilarity > 0) {
            score += weights.title * titleSimilarity;
            hasRelation = true;
        }

        if (targetDurationSeconds !== undefined && candidate.duration) {
            const durationDeltaSeconds = Math.abs(
                timeToSeconds(candidate.duration) - targetDurationSeconds
            );
            score -= (durationDeltaSeconds / 3600) * weights.duration;
        }

        return hasRelation ? { game: candidate, score } : undefined;
    }
}

function hasAllGenres(targetGenres: Set<number>, candidateGenres?: number[]): boolean {
    if (targetGenres.size === 0 || !candidateGenres?.length) return false;

    const uniqueCandidateGenres = new Set(candidateGenres);
    return [...targetGenres].every((genre) => uniqueCandidateGenres.has(genre));
}

function compareText(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}
