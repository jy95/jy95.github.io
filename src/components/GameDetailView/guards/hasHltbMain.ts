import hasKey from "./hasKey";
import type { GameDetailsEntry } from "../types";
import type { BacklogEntry } from "@/app/api/backlog/route";

export function hasHltbMain(game: GameDetailsEntry): game is BacklogEntry & { hltb_main: string } {
    return hasKey(game, "hltb_main", (val): val is string => typeof val === "string" && val !== "00:00:00");
}