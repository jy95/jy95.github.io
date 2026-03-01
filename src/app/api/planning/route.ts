import { NextResponse } from "next/server";
import { extractGameCardProps } from "@/redux/sharedDefintion";
import type { BasicGame, BasicPlaylist, BasicVideo, CardEntry, YTUrlType } from "@/redux/sharedDefintion";

type rawEntry = Omit<BasicGame, "genres" | "releaseDate" | "id" >;
export type planningEntry = Omit<BasicGame, "genres" | "videoId" | "playlistId" | "releaseDate"> & {
    /** @description Still in progress or finished ? */
    status: "RECORDED" | "PENDING";
    /** @description When to display the game public, such as 20210412 (12/04/2021) */
    releaseDate?: number;
    /** @description When to display the game public, such as 20210420 (20/04/2021) */
    endDate?: number;
} & CardEntry;

export async function GET() {

    // Game data
    const games = (await import("./planning.json")).default;
    
    return NextResponse.json(games.map(game => enhanceGameItem(game)), {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

// Turn "YYYY...MMDD" to int
function turnDateToInt(value: string | undefined) {
    if (value) {
        // TODO one day, remove that & let PlanningColumn do the job
        return new Date(value).getTime();
    } else {
        return undefined;
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): planningEntry {

    const metadata = extractGameCardProps(game);

    return {
        id: metadata.id,
        title: game.title,
        platform: game.platform,
        status:  (game.hasOwnProperty("endAt") ? "RECORDED" : "PENDING"),
        imagePath: `/covers/${metadata.id}/${game.coverFile ?? "cover.webp"}`,
        releaseDate: turnDateToInt(game?.availableAt),
        endDate: turnDateToInt(game?.endAt),
        url: metadata.url,
        url_type: metadata.url_type
    }
}