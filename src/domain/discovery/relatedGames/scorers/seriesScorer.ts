import type { Scorer } from "./types";

export const scoreSeries: Scorer = (candidate, context) => {
    const candidateSeries = context.seriesMap[candidate.id];
    if (!context.targetSeries || !candidateSeries || context.targetSeries.id !== candidateSeries.id) {
        return null;
    }

    // A zero distance is handled safely if imported series data contains duplicate positions.
    const distance = Math.abs(context.targetSeries.order - candidateSeries.order);

    return {
        points: context.weights.series + context.weights.adjacentSeries / Math.max(1, distance),
        related: true,
    };
};