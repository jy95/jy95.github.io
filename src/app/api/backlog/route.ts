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
    "notes"?: string
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