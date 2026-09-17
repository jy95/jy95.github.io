import { timeToSeconds } from "@/domain/games";
import type { CardGame } from "@/domain/games";

import type { TierCategoryKey as RelatedGameTier } from '@/types/tierList';

export interface RelatedGameResult {
    game: CardGame;
    score: number;
}

export type SeriesGame = {
    id: string;
    order: number;
};

export type RelatedGamesWeights = {
    series: number;
    adjacentSeries: number;
    title: number;
    genres: number;
    genre: number;
    platform: number;
    duration: number;
    tier: Record<RelatedGameTier, number>;
};

export interface RelatedGamesOptions {
    /** Maps card IDs to a series ID and an ordered position in that series. */
    seriesMap?: Record<string, SeriesGame>;
    /** Maps candidate game ids to their tier-list category. */
    tierMap?: Record<string, RelatedGameTier>;
    weights?: Partial<Omit<RelatedGamesWeights, "tier">> & {
        tier?: Partial<Record<RelatedGameTier, number>>;
    };
    /** Max number of results to return. `@default` 3 */
    limit?: number;
}

const DEFAULT_WEIGHTS: RelatedGamesWeights = {
    // Adds 10,000 points for a shared series, keeping series matches dominant.
    series: 10_000,
    // Adds up to 2,000 points divided by series distance, favoring direct neighbors.
    adjacentSeries: 2_000,
    // Adds up to 300 points based on normalized title similarity.
    title: 300,
    // Adds 100 points when at least one genre is shared.
    genres: 100,
    // Adds 25 points for each shared genre.
    genre: 25,
    // Adds 75 points for a shared platform.
    platform: 75,
    // Subtracts 50 points for each hour of duration difference.
    duration: 50,
    tier: {
        // Adds 600 points to make masterpieces the strongest quality adjustment, not a relation.
        tier_masterpiece: 600,
        // Adds 500 points to strongly favor excellent games below masterpieces.
        tier_excellent: 500,
        // Adds 400 points to give good games a moderate quality advantage.
        tier_good: 400,
        // Adds 300 points to give average games a smaller quality advantage.
        tier_average: 300,
        // Adds 200 points to keep poor games eligible with a low quality adjustment.
        tier_poor: 200,
        // Adds 100 points, the smallest evaluated-tier quality adjustment.
        tier_bad: 100,
        // Adds no points when a game has not been evaluated.
        tier_not_evaluated: 0,
    },
};

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

        if (targetGenres.size > 0 && candidate.genres && candidate.genres.length > 0) {
            const sharedCount = candidate.genres.filter((g) => targetGenres.has(g)).length;
            if (sharedCount > 0) {
                score += weights.genres + sharedCount * weights.genre;
                hasRelation = true;
            }
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

function titleBigrams(title: string): string[] {
    const normalized = title
        .toLowerCase()
        .replace(/\p{P}+/gu, "")
        .replace(/\s+/g, " ")
        .trim();

    return Array.from({ length: Math.max(0, normalized.length - 1) }, (_, index) =>
        normalized.slice(index, index + 2)
    );
}

function diceCoefficient(left: string[], right: string[]): number {
    if (left.length === 0 || right.length === 0) return 0;

    const rightCounts = new Map<string, number>();
    for (const bigram of right) rightCounts.set(bigram, (rightCounts.get(bigram) ?? 0) + 1);

    let intersection = 0;
    for (const bigram of left) {
        const count = rightCounts.get(bigram) ?? 0;
        if (count > 0) {
            intersection += 1;
            rightCounts.set(bigram, count - 1);
        }
    }

    return (2 * intersection) / (left.length + right.length);
}

function compareText(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

export type RelatedGameEntry = {
    id: string;
    title: string;
    imagePath: string;
    url: string;
    url_type: CardGame["url_type"];
};

export type RelatedGamesMap = Record<string, RelatedGameEntry[]>;
