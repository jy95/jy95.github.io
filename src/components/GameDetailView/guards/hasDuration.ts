import hasKey from "./hasKey";
import type { GameDetailsEntry } from "../types";

export default function hasDuration(game: GameDetailsEntry): game is GameDetailsEntry & { duration: string } {
    return hasKey(game, "duration", (val): val is string => typeof val === "string" && val !== "00:00:00");
}