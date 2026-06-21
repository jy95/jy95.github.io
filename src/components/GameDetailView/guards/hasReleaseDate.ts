import hasKey from "./hasKey";
import type { GameDetailsEntry } from "../types";

export function hasReleaseDate(game: GameDetailsEntry): game is GameDetailsEntry & { releaseDate: string } {
    return hasKey(game, "releaseDate", (val): val is string => typeof val === "string");
}