import type { Scorer } from "./types";

export const scorePlatform: Scorer = (candidate, context) => {
    if (context.target.platform === undefined || candidate.platform !== context.target.platform) {
        return null;
    }

    return { points: context.weights.platform, related: true };
};