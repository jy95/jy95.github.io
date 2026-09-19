import { hasAllGenres } from "../genreMatching";
import type { Scorer } from "./types";

export const scoreGenres: Scorer = (candidate, context) => {
    if (!hasAllGenres(context.targetGenres, candidate.genres)) return null;

    return {
        points: context.weights.genres + context.targetGenres.size * context.weights.genre,
        related: true,
    };
};