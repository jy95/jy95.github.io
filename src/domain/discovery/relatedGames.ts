import { timeToSeconds } from "@/domain/games";
import type { CardGame } from "@/domain/games";

export type RelatedGameReason = "series" | "genres" | "platform" | "duration";

export interface RelatedGameResult {
    game: CardGame;
    reason: RelatedGameReason;
    score: number;
}

export interface RelatedGamesOptions {
    /** Maps a game id to its series id, when known. Omit if series data isn't available. */
    seriesMap?: Record<string, string>;
    /** Max number of results to return. @default 3 */
    limit?: number;
}

// Two games are considered "similar duration" if they differ by no more
// than this many seconds (2 hours).
const DURATION_SIMILARITY_THRESHOLD_SECONDS = 2 * 3600;

/**
 * Deterministic "you might also like" candidate scoring.
 *
 * Priority: same series > shared genres > same platform > similar duration.
 * Only the single best-matching reason is recorded per candidate (a game
 * already related by series isn't also credited for sharing a genre) so
 * that the displayed reason is always the most meaningful one.
 *
 * Pure function: no I/O, no randomness — same inputs always produce the
 * same ordered output, which is what makes this testable and cache-friendly.
 */
export function getRelatedGames(
    target: CardGame,
    candidates: CardGame[],
    options: RelatedGamesOptions = {}
): RelatedGameResult[] {
    const { seriesMap = {}, limit = 3 } = options;

    const targetSeries = seriesMap[target.id];
    const targetGenres = new Set(target.genres ?? []);
    const targetDurationSeconds = target.duration ? timeToSeconds(target.duration) : undefined;

    const scored: RelatedGameResult[] = [];

    for (const candidate of candidates) {
        if (candidate.id === target.id) continue;

        const result = scoreCandidate(candidate);
        if (result) scored.push(result);
    }

    // Deterministic ordering: highest score first, alphabetical tiebreak.
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.game.title.localeCompare(b.game.title);
    });

    return dedupeById(scored).slice(0, limit);

    function scoreCandidate(candidate: CardGame): RelatedGameResult | undefined {
        const candidateSeries = seriesMap[candidate.id];
        if (targetSeries && candidateSeries && candidateSeries === targetSeries) {
            return { game: candidate, reason: "series", score: 100 };
        }

        if (targetGenres.size > 0 && candidate.genres?.length) {
            const sharedCount = candidate.genres.filter((g) => targetGenres.has(g)).length;
            if (sharedCount > 0) {
                return { game: candidate, reason: "genres", score: 50 + sharedCount };
            }
        }

        if (target.platform !== undefined && candidate.platform === target.platform) {
            return { game: candidate, reason: "platform", score: 30 };
        }

        if (
            targetDurationSeconds !== undefined &&
            candidate.duration &&
            Math.abs(timeToSeconds(candidate.duration) - targetDurationSeconds) <=
                DURATION_SIMILARITY_THRESHOLD_SECONDS
        ) {
            return { game: candidate, reason: "duration", score: 10 };
        }

        return undefined;
    }
}

function dedupeById(results: RelatedGameResult[]): RelatedGameResult[] {
    const seen = new Set<string>();
    return results.filter((result) => {
        if (seen.has(result.game.id)) return false;
        seen.add(result.game.id);
        return true;
    });
}

export type RelatedGameEntry = {
    id: string;
    title: string;
    imagePath: string;
    url: string;
    url_type: CardGame["url_type"];
    reason: RelatedGameReason;
};

export type RelatedGamesMap = Record<string, RelatedGameEntry[]>;