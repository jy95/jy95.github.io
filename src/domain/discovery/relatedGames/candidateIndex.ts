import { titleBigrams } from "./titleSimilarity";
import type { CardGame } from "@/domain/games";

/**
 * Precomputed, reusable view over a candidate pool. Building this once and
 * passing it to every `getRelatedGames` call (instead of a plain array)
 * avoids recomputing each candidate's title bigrams once per target — the
 * bigrams depend only on the candidate, never on the target being scored.
 */
export interface CandidateIndex {
    candidates: CardGame[];
    bigramsById: ReadonlyMap<string, string[]>;
}

export function buildCandidateIndex(candidates: CardGame[]): CandidateIndex {
    const bigramsById = new Map<string, string[]>();
    for (const candidate of candidates) {
        bigramsById.set(candidate.id, titleBigrams(candidate.title));
    }
    return { candidates, bigramsById };
}