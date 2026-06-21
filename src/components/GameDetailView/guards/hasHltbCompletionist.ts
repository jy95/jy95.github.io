import hasKey from "./hasKey";
import type { GameDetailsEntry } from "../types";

export default function hasHltbCompletionist(game: GameDetailsEntry): game is GameDetailsEntry & { hltb_completionist: string } {
    return hasKey(game, "hltb_completionist", (val): val is string => typeof val === "string" && val !== "00:00:00");
}