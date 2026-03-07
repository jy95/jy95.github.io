import { NextResponse } from "next/server";

import type { CardEntry, YTUrlType } from "@/redux/sharedDefintion";

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
} & CardEntry;

// Raw entry 
type RawBacklogEntry = Omit<BacklogEntry, "id" | "imagePath" | "url" | "url_type">;
export type RawPayload = RawBacklogEntry[];

export async function GET() {

    // Game data
    const gamesData = (await import("./backlog.json")).default;
    const games = gamesData.map( (game) => enhanceGameItem(game, game.id) );

    return NextResponse.json(games, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: RawBacklogEntry, id: number): BacklogEntry {

    return Object.assign({}, game, {
        // MUI: The data grid component requires all rows to have a unique `id` property.
        "id": id.toString(),
        "imagePath": `/backlogcovers/${id}/cover.webp`,
        "url": "",
        "url_type": "VIDEO" as YTUrlType
    })
}