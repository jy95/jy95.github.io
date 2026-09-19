import { timeToSeconds } from "@/domain/games";
import type { CardGame } from "@/domain/games";
import type { ScoringContext } from "./types";

/**
 * Not a relation scorer: unlike the others in this folder, this never makes
 * a candidate eligible on its own — it only nudges the ranking of
 * candidates that are already related through some other signal (series,
 * genres, platform, or title). That's why it returns a plain number rather
 * than a `ScorerResult`.
 */
export function scoreDurationPenalty(candidate: CardGame, context: ScoringContext): number {
    if (context.targetDurationSeconds === undefined || !candidate.duration) return 0;

    const durationDeltaSeconds = Math.abs(
        timeToSeconds(candidate.duration) - context.targetDurationSeconds
    );

    return (durationDeltaSeconds / 3600) * context.weights.duration;
}