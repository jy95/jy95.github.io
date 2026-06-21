import type { GameDetailsEntry, WithProperty } from "./types";
import type { BacklogEntry } from "@/app/api/backlog/route";

function hasKey<T extends object, K extends PropertyKey, V>(
    obj: T,
    key: K,
    validator: (value: unknown) => value is V
): obj is WithProperty<T, K, V> {
    return key in obj && validator((obj as any)[key]);
}

export function hasGenres(game: GameDetailsEntry): game is GameDetailsEntry & { genres: number[] } {
    return hasKey(game, "genres", (val): val is number[] => Array.isArray(val) && val.length > 0);
}

export function hasDuration(game: GameDetailsEntry): game is GameDetailsEntry & { duration: string } {
    return hasKey(game, "duration", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

export function hasReleaseDate(game: GameDetailsEntry): game is GameDetailsEntry & { releaseDate: string } {
    return hasKey(game, "releaseDate", (val): val is string => typeof val === "string");
}

export function hasHltbMain(game: GameDetailsEntry): game is BacklogEntry & { hltb_main: string } {
    return hasKey(game, "hltb_main", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

export function hasHltbExtra(game: GameDetailsEntry): game is GameDetailsEntry & { hltb_extra: string } {
    return hasKey(game, "hltb_extra", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

export function hasHltbCompletionist(game: GameDetailsEntry): game is GameDetailsEntry & { hltb_completionist: string } {
    return hasKey(game, "hltb_completionist", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
};