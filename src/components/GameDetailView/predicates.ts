import type { GameDetailsEntry } from "./types";

const DURATION_FIELDS = ["duration", "hltb_main", "hltb_extra", "hltb_completionist"] as const;
type DurationField = (typeof DURATION_FIELDS)[number];

function hasMeaningfulDuration<K extends DurationField>(
    game: GameDetailsEntry,
    key: K
): game is GameDetailsEntry & Record<K, string> {
    const value = game[key];
    return typeof value === "string" && value !== "00:00:00";
}

export const hasDuration = (game: GameDetailsEntry): game is GameDetailsEntry & { duration: string } =>
    hasMeaningfulDuration(game, "duration");

export const hasHltbMain = (game: GameDetailsEntry): game is GameDetailsEntry & { hltb_main: string } =>
    hasMeaningfulDuration(game, "hltb_main");

export const hasHltbExtra = (game: GameDetailsEntry): game is GameDetailsEntry & { hltb_extra: string } =>
    hasMeaningfulDuration(game, "hltb_extra");

export const hasHltbCompletionist = (game: GameDetailsEntry): game is GameDetailsEntry & { hltb_completionist: string } =>
    hasMeaningfulDuration(game, "hltb_completionist");

export const hasReleaseDate = (game: GameDetailsEntry): game is GameDetailsEntry & { releaseDate: string } =>
    typeof game.releaseDate === "string";

export const hasGenres = (game: GameDetailsEntry): game is GameDetailsEntry & { genres: number[] } =>
    Array.isArray(game.genres) && game.genres.length > 0;