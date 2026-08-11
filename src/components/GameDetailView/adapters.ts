import type { BacklogEntry } from "@/app/api/backlog/route";
import type { CardGame } from "@/redux/sharedDefintion";
import type { GameDetailsEntry } from "./types";

/** The two raw shapes GameDetailView is handed by its callers. */
export type RawGameDetailsEntry = BacklogEntry | CardGame;

export function isCardGame(game: RawGameDetailsEntry): game is CardGame {
    return "url_type" in game;
}

/**
 * Normalizes either raw shape into the flattened, discriminated
 * GameDetailsEntry used for rendering, so downstream code (rows,
 * predicates) only ever deals with one of two concrete, mutually
 * exclusive shapes instead of a loose "everything optional" union.
 */
export function toGameDetailsEntry(game: RawGameDetailsEntry): GameDetailsEntry {
    if (isCardGame(game)) {
        return {
            ...game,
            kind: "card"
        };
    }

    return {
        ...game,
        kind: "backlog",
    };
}