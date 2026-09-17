import { timeToSeconds } from "@/domain/games";
import type { CardGame } from "@/domain/games";

export type RelatedGameReason = "series" | "genres" | "platform" | "duration";
export type RelatedGameTier =
    | "tier_masterpiece"
    | "tier_excellent"
    | "tier_good"
    | "tier_average"
    | "tier_poor"
    | "tier_bad"
    | "tier_not_evaluated";

export interface RelatedGameResult {
    game: CardGame;
    reason: RelatedGameReason;
    score: number;
}

export interface RelatedGamesOptions {
    /** Maps a game id to its series id, when known. Omit if series data isn't available. */
    seriesMap?: Record<string, string>;
    /** Maps candidate game ids to their tier-list category. */
    tierMap?: Record<string, RelatedGameTier>;
    /** Max number of results to return. @default 3 */
    limit?: number;
}

// Two games are considered "similar duration" if they differ by no more
// than this many seconds (2 hours).
const DURATION_SIMILARITY_THRESHOLD_SECONDS = 2 * 3600;
const REASON_PRIORITY: RelatedGameReason[] = ["series", "genres", "platform", "duration"];
const TIER_PRIORITY: RelatedGameTier[] = [
    "tier_masterpiece",
    "tier_excellent",
    "tier_good",
    "tier_average",
    "tier_poor",
    "tier_bad",
    "tier_not_evaluated",
];

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
    const { seriesMap = {}, tierMap = {}, limit = 3 } = options;

    const targetSeries = seriesMap[target.id];
    const targetGenres = new Set(target.genres ?? []);
    const targetDurationSeconds = target.duration ? timeToSeconds(target.duration) : undefined;

    const scored: RelatedGameResult[] = [];

    for (const candidate of candidates) {
        if (candidate.id === target.id) continue;

        const result = scoreCandidate(candidate);
        if (result) scored.push(result);
    }

    const unique = dedupeById(scored);
    const selected: RelatedGameResult[] = [];
    const selectedIds = new Set<string>();

    // Reserve one slot for each available reason before filling from the
    // remaining candidates. Reason priority keeps the output stable when the
    // result limit is smaller than the number of available reasons.
    for (const reason of REASON_PRIORITY) {
        const best = unique.filter((result) => result.reason === reason).sort(compareCandidates)[0];
        if (best && selected.length < limit) {
            selected.push(best);
            selectedIds.add(best.game.id);
        }
    }

    const remaining = unique.filter((result) => !selectedIds.has(result.game.id)).sort(compareCandidates);
    return selected.concat(remaining).slice(0, limit);

    function compareCandidates(a: RelatedGameResult, b: RelatedGameResult): number {
        const tierDifference = tierRank(a.game.id) - tierRank(b.game.id);
        if (tierDifference !== 0) return tierDifference;
        if (b.score !== a.score) return b.score - a.score;
        const titleDifference = compareText(a.game.title, b.game.title);
        return titleDifference || compareText(a.game.id, b.game.id);
    }

    function tierRank(gameId: string): number {
        return TIER_PRIORITY.indexOf(tierMap[gameId] ?? "tier_not_evaluated");
    }

    function scoreCandidate(candidate: CardGame): RelatedGameResult | undefined {
        const relations: RelatedGameResult[] = [];
        const candidateSeries = seriesMap[candidate.id];
        if (targetSeries && candidateSeries && candidateSeries === targetSeries) {
            relations.push({ game: candidate, reason: "series", score: 100 });
        }

        if (targetGenres.size > 0 && candidate.genres?.length) {
            const sharedCount = candidate.genres.filter((g) => targetGenres.has(g)).length;
            if (sharedCount > 0) {
                relations.push({ game: candidate, reason: "genres", score: 50 + sharedCount });
            }
        }

        if (target.platform !== undefined && candidate.platform === target.platform) {
            relations.push({ game: candidate, reason: "platform", score: 30 });
        }

        if (
            targetDurationSeconds !== undefined &&
            candidate.duration &&
            Math.abs(timeToSeconds(candidate.duration) - targetDurationSeconds) <=
                DURATION_SIMILARITY_THRESHOLD_SECONDS
        ) {
            const difference = Math.abs(timeToSeconds(candidate.duration) - targetDurationSeconds);
            relations.push({
                game: candidate,
                reason: "duration",
                score: 10 + (DURATION_SIMILARITY_THRESHOLD_SECONDS - difference) / DURATION_SIMILARITY_THRESHOLD_SECONDS,
            });
        }

        return relations.sort(
            (a, b) => REASON_PRIORITY.indexOf(a.reason) - REASON_PRIORITY.indexOf(b.reason)
        )[0];
    }
}

function compareText(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
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
