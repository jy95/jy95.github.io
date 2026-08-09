import type { BacklogEntry } from "@/app/api/backlog/route";
import type { CardGame } from "@/redux/sharedDefintion";
import type { GameDetailsEntry } from "./types";

/** The two raw shapes GameDetailView is handed by its callers. */
export type RawGameDetailsEntry = BacklogEntry | CardGame;

export function isCardGame(game: RawGameDetailsEntry): game is CardGame {
    return "url_type" in game;
}

/**
 * Normalizes either raw shape into the flattened GameDetailsEntry used for
 * rendering, so downstream code (rows, predicates) only ever deals with one
 * concrete type instead of a union.
 */
export function toGameDetailsEntry(game: RawGameDetailsEntry): GameDetailsEntry {
    if (isCardGame(game)) {
        return {
            id: game.id,
            title: game.title,
            imagePath: game.imagePath,
            platform: game.platform,
            genres: game.genres,
            releaseDate: game.releaseDate,
            duration: game.duration,
            url: game.url,
            url_type: game.url_type,
        };
    }

    return {
        id: game.id,
        title: game.title,
        imagePath: game.imagePath,
        platform: game.platform,
        notes: game.notes,
        hltb_main: game.hltb_main,
        hltb_extra: game.hltb_extra,
        hltb_completionist: game.hltb_completionist,
    };
}