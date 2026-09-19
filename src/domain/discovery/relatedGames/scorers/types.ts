import type { CardGame } from "@/domain/games";
import type { RelatedGamesWeights, SeriesGame } from "../types";
import type { TierCategoryKey as RelatedGameTier } from "@/types/tierList";

export type ScoringContext = {
    target: CardGame;
    targetSeries?: SeriesGame;
    targetGenres: Set<number>;
    targetDurationSeconds?: number;
    targetTitleBigrams: string[];
    seriesMap: Record<string, SeriesGame>;
    tierMap: Record<string, RelatedGameTier>;
    weights: RelatedGamesWeights;
    candidateBigrams: ReadonlyMap<string, string[]>;
};

export type ScorerResult = {
    points: number;
    related: true;
};

/**
 * A single, independent relation rule. Returns `null` when the candidate
 * isn't related to the target through this rule, or a positive score
 * contribution when it is. Each scorer only reads from `ScoringContext` —
 * it never mutates shared state — so scorers can be added, removed, or
 * unit-tested in isolation from one another.
 */
export type Scorer = (candidate: CardGame, context: ScoringContext) => ScorerResult | null;