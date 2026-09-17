import type { RelatedGamesWeights } from "./types";

export const DEFAULT_WEIGHTS: RelatedGamesWeights = {
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
