import { NextResponse } from "next/server";

import type { 
    Platform
} from "@/redux/sharedDefintion";

export type BacklogEntry = {
    /** @description Name of the game */
    "title": string,
    /** @description Platform for that game */
    "platform"?: Platform,
    /** @description Extra notes */
    "notes"?: string
}

// Revalidate at most every day
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 86400;

// An entry in the json file

export async function GET() {

    // Game data
    const gamesData = (await import("./backlog.json")).default as BacklogEntry[];

    return NextResponse.json(gamesData);
}