import { timeToSeconds } from "@/domain/games";
import { hasAllGenres } from "./genreMatching";
import { diceCoefficient, titleBigrams } from "./titleSimilarity";

import type { CardGame } from "@/domain/games";
import type {
    RelatedGameResult,
    RelatedGamesWeights,
    SeriesGame,
} from "./types";
import type { TierCategoryKey as RelatedGameTier } from "@/types/tierList";

type CandidateScoringContext = {
    target: CardGame;
    targetSeries?: SeriesGame;
    targetGenres: Set<number>;
    targetDurationSeconds?: number;
    targetTitleBigrams: string[];
    seriesMap: Record<string, SeriesGame>;
    tierMap: Record<string, RelatedGameTier>;
    weights: RelatedGamesWeights;
};

export function scoreCandidate(
    candidate: CardGame,
    context: CandidateScoringContext
): RelatedGameResult | undefined {
    const {
        target,
        targetSeries,
        targetGenres,
        targetDurationSeconds,
        targetTitleBigrams,
        seriesMap,
        tierMap,
        weights,
    } = context;
    const candidateSeries = seriesMap[candidate.id];
    let score = weights.tier[tierMap[candidate.id]] ?? weights.tier.tier_not_evaluated;
    let hasRelation = false;

    if (targetSeries && candidateSeries && targetSeries.id === candidateSeries.id) {
        const distance = Math.abs(targetSeries.order - candidateSeries.order);
        score += weights.series;
        // A zero distance is handled safely if imported series data contains duplicate positions.
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
