import { scoreSeries } from "./scorers/seriesScorer";
import { scoreGenres } from "./scorers/genreScorer";
import { scorePlatform } from "./scorers/platformScorer";
import { scoreTitle } from "./scorers/titleScorer";
import { scoreDurationPenalty } from "./scorers/durationScorer";

import type { CardGame } from "@/domain/games";
import type { RelatedGameResult } from "./types";
import type { Scorer, ScoringContext } from "./scorers/types";

// Each entry is an independent relation rule (see scorers/types.ts). Adding
// or removing a way for two games to be "related" is a one-line change
// here, instead of editing a function with shared mutable state.
const RELATION_SCORERS: Scorer[] = [scoreSeries, scoreGenres, scorePlatform, scoreTitle];

export function scoreCandidate(
    candidate: CardGame,
    context: ScoringContext
): RelatedGameResult | undefined {
    let score = context.weights.tier[context.tierMap[candidate.id]] ?? context.weights.tier.tier_not_evaluated;
    let hasRelation = false;

    for (const scorer of RELATION_SCORERS) {
        const result = scorer(candidate, context);
        if (result) {
            score += result.points;
            hasRelation = true;
        }
    }

    // Applied regardless of hasRelation — it's a quality adjustment on an
    // already-related candidate, not a relation in its own right.
    score -= scoreDurationPenalty(candidate, context);

    return hasRelation ? { game: candidate, score } : undefined;
}