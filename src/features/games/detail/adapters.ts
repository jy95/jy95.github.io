import type { BacklogEntry } from "@/app/api/backlog/route";
import type { CardGame } from "@/domain/games";
import type { GameDetailsEntry } from "./types";

export type RawGameDetailsEntry = BacklogEntry | CardGame;

export function isCardGame(game: RawGameDetailsEntry): game is CardGame {
    return "url_type" in game;
}

export function toGameDetailsEntry(game: RawGameDetailsEntry): GameDetailsEntry {
    if (isCardGame(game)) {
        return { ...game, kind: "card" };
    }

    return { ...game, kind: "backlog" };
}
