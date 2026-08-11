import type { GameDetailsEntry, CardKindEntry, BacklogKindEntry } from "./types";

function isMeaningfulDuration(value: string | undefined): value is string {
    return typeof value === "string" && value !== "00:00:00";
}

export const hasDuration = (game: GameDetailsEntry): game is CardKindEntry & { duration: string } =>
    game.kind === "card" && isMeaningfulDuration(game.duration);

export const hasHltbMain = (game: GameDetailsEntry): game is BacklogKindEntry & { hltb_main: string } =>
    game.kind === "backlog" && isMeaningfulDuration(game.hltb_main);

export const hasHltbExtra = (game: GameDetailsEntry): game is BacklogKindEntry & { hltb_extra: string } =>
    game.kind === "backlog" && isMeaningfulDuration(game.hltb_extra);

export const hasHltbCompletionist = (game: GameDetailsEntry): game is BacklogKindEntry & { hltb_completionist: string } =>
    game.kind === "backlog" && isMeaningfulDuration(game.hltb_completionist);

export const hasReleaseDate = (game: GameDetailsEntry): game is CardKindEntry & { releaseDate: string } =>
    game.kind === "card" && typeof game.releaseDate === "string";

export const hasGenres = (game: GameDetailsEntry): game is CardKindEntry & { genres: number[] } =>
    game.kind === "card" && Array.isArray(game.genres) && game.genres.length > 0;