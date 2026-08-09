import { NextResponse } from "next/server";

import type { BasicCard } from "@/redux/sharedDefintion";

// An entry of backlog
export type BacklogEntry = {
    /**@description Id */
    "id": string,
    /** @description Name of the game */
    "title": string,
    /** @description Platform for that game */
    "platform"?: number,
    /** @description Extra notes */
    "notes"?: string,
    /** @description Duration of the walkthrough (e.g. "01:42:13") */
    "hltb_main"?: string,
    /** @description Duration of the walkthrough + extras (e.g. "02:30:00") */
    "hltb_extra"?: string,
    /** @description Duration of the completionist walkthrough (e.g. "03:45:00") */
    "hltb_completionist"?: string,
} & BasicCard;

type RawBacklogEntry = Omit<BacklogEntry, "id" | "imagePath">;
export type RawPayload = RawBacklogEntry[];

export async function GET() {
    const gamesData = (await import("./backlog.json")).default;
    const games = gamesData.map((game) => enhanceGameItem(game, game.id));

    return NextResponse.json(games, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function enhanceGameItem(game: RawBacklogEntry, id: number): BacklogEntry {
    return {
        ...game,
        id: id.toString(),
        imagePath: `/backlogcovers/${id}/cover.webp`,
    };
}