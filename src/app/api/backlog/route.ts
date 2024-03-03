import { NextResponse } from "next/server";

import type { 
    Platform
} from "@/redux/sharedDefintion";

// An entry of backlog
export type BacklogEntry = {
    /**@description Id */
    "id": string,
    /** @description Name of the game */
    "title": string,
    /** @description Platform for that game */
    "platform"?: Platform,
    /** @description Extra notes */
    "notes"?: string
}

// Raw entry 
type RawBacklogEntry = Exclude<BacklogEntry, "id">;

// Revalidate at most every day
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 86400;

// An entry in the json file

export async function GET() {

    // Game data
    const gamesData = (await import("./backlog.json")).default;
    const games = gamesData.map( (game, idx) => enhanceGameItem(game as RawBacklogEntry, idx) );

    return NextResponse.json(games);
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: RawBacklogEntry, idx: number): BacklogEntry {
    return Object.assign({}, game, {
        // MUI: The data grid component requires all rows to have a unique `id` property.
        "id": idx.toString()
    })
}