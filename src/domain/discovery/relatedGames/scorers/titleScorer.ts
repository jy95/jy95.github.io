import { diceCoefficient, titleBigrams } from "../titleSimilarity";
import type { Scorer } from "./types";

export const scoreTitle: Scorer = (candidate, context) => {
    // Falls back to computing bigrams on the fly if the candidate wasn't
    // part of a pre-built CandidateIndex (e.g. a caller passed a plain
    // array directly to getRelatedGames).
    const candidateBigrams = context.candidateBigrams.get(candidate.id) ?? titleBigrams(candidate.title);
    const similarity = diceCoefficient(context.targetTitleBigrams, candidateBigrams);

    if (similarity <= 0) return null;

    return { points: context.weights.title * similarity, related: true };
};