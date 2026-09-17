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

// Two games are considered "similar duration" if they differ by no more
// than this many seconds (1 hour).
const DURATION_SIMILARITY_THRESHOLD_SECONDS = 3600;

const DEFAULT_WEIGHTS: RelatedGamesWeights = {
    // The series base score keeps series titles above ordinary similarity matches.
    series: 10_000,
    // The score is divided by series distance. Direct neighbors get the full value.
    adjacentSeries: 2_000,
    genres: 100,
    genre: 25,
    platform: 75,
    duration: 50,
    tier: {
        tier_masterpiece: 600,
        tier_excellent: 500,
        tier_good: 400,
        tier_average: 300,
        tier_poor: 200,
        tier_bad: 100,
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
        let score = weights.tier[tierMap[candidate.id]] ?? "tier_not_evaluated";
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

        if (
            targetDurationSeconds !== undefined &&
            candidate.duration &&
            Math.abs(timeToSeconds(candidate.duration) - targetDurationSeconds) <=
            DURATION_SIMILARITY_THRESHOLD_SECONDS
        ) {
            const difference = Math.abs(timeToSeconds(candidate.duration) - targetDurationSeconds);
            score += weights.duration *
                (1 - difference / DURATION_SIMILARITY_THRESHOLD_SECONDS);
            hasRelation = true;
        }

        return hasRelation ? { game: candidate, score } : undefined;
    }
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
