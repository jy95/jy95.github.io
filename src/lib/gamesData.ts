import { buildCardGame } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import type { RawGame, CardGame } from "@/domain/games";
import type { BacklogEntry, PlanningEntry } from "@/domain/games/details";

export type RawPublishedGame = RawGame & { genres: number[] };
export type StoredDlcGroup = {
    id: string;
    game_title: string;
    dlcs: (RawGame & { id: number })[];
};
export type RawBacklogEntry = Omit<BacklogEntry, "id" | "imagePath">;
type StoredBacklogEntry = RawBacklogEntry & { id: number };

export async function loadPublishedGames(): Promise<RawPublishedGame[]> {
    return (await import("@/app/api/games/games.json")).default;
}

export async function loadDlcGroups(): Promise<StoredDlcGroup[]> {
    return (await import("@/app/api/dlcs/dlcs.json")).default;
}

export async function loadPlanningGames(): Promise<RawGame[]> {
    return (await import("@/app/api/planning/planning.json")).default;
}

export async function loadBacklogGames(): Promise<StoredBacklogEntry[]> {
    return (await import("@/app/api/backlog/backlog.json")).default;
}

export function toPublishedGame(game: RawGame): CardGame {
    return buildCardGame(game, COVER_PATHS.games);
}

export function toPlanningEntry(game: RawGame): PlanningEntry {
    return {
        ...toPublishedGame(game),
        status: Object.hasOwn(game, "endAt") ? "RECORDED" : "PENDING",
    };
}

export function toBacklogEntry(game: StoredBacklogEntry): BacklogEntry {
    return {
        ...game,
        id: game.id.toString(),
        imagePath: `${COVER_PATHS.backlog}/${game.id}/cover.webp`,
    };
}
