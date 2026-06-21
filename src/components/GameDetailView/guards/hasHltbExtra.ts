import hasKey from "./hasKey";
import type { GameDetailsEntry } from "../types";

export function hasHltbExtra(game: GameDetailsEntry): game is GameDetailsEntry & { hltb_extra: string } {
    return hasKey(game, "hltb_extra", (val): val is string => typeof val === "string" && val !== "00:00:00");
}