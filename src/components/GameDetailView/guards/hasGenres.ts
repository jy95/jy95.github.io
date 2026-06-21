import hasKey from "./hasKey";
import type { GameDetailsEntry } from "../types";

export function hasGenres(game: GameDetailsEntry): game is GameDetailsEntry & { genres: number[] } {
    return hasKey(game, "genres", (val): val is number[] => Array.isArray(val) && val.length > 0);
}