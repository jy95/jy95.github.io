import { isMeaningfulDuration } from "@/domain/games";
import type { GameDetailsEntry, CardKindEntry, BacklogKindEntry } from "./types";

/**
 * Generic shape shared by hasDuration/hasHltbMain/hasHltbExtra/
 * hasHltbCompletionist: narrow to a discriminated-union `kind`, read one
 * duration-shaped string property off it, and treat it as present only
 * when it passes the domain's "meaningful duration" rule (i.e. it isn't
 * the "00:00:00" sentinel). Every one of those four predicates used to
 * repeat this exact four-step shape by hand; this is the one place that
 * does it now.
 *
 * Kept generic over the discriminant `K` and the property `P` so callers
 * get a real, non-widened TypeScript type predicate back (no `any`).
 */
function hasMeaningfulDurationProperty<
    K extends GameDetailsEntry["kind"],
    P extends string
>(kind: K, property: P) {
    return (
        game: GameDetailsEntry
    ): game is Extract<GameDetailsEntry, { kind: K }> & Record<P, string> =>
        game.kind === kind && isMeaningfulDuration((game as Record<string, unknown>)[property] as string | undefined);
}

export const hasDuration = hasMeaningfulDurationProperty<"card", "duration">("card", "duration") as
    (game: GameDetailsEntry) => game is CardKindEntry & { duration: string };

export const hasHltbMain = hasMeaningfulDurationProperty<"backlog", "hltb_main">("backlog", "hltb_main") as
    (game: GameDetailsEntry) => game is BacklogKindEntry & { hltb_main: string };

export const hasHltbExtra = hasMeaningfulDurationProperty<"backlog", "hltb_extra">("backlog", "hltb_extra") as
    (game: GameDetailsEntry) => game is BacklogKindEntry & { hltb_extra: string };

export const hasHltbCompletionist = hasMeaningfulDurationProperty<"backlog", "hltb_completionist">("backlog", "hltb_completionist") as
    (game: GameDetailsEntry) => game is BacklogKindEntry & { hltb_completionist: string };

export const hasReleaseDate = (game: GameDetailsEntry): game is CardKindEntry & { releaseDate: string } =>
    game.kind === "card" && typeof game.releaseDate === "string";

export const hasGenres = (game: GameDetailsEntry): game is CardKindEntry & { genres: number[] } =>
    game.kind === "card" && Array.isArray(game.genres) && game.genres.length > 0;