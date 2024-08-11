import { NextResponse } from "next/server";
import type { BasicGame, BasicPlaylist, BasicVideo } from "@/redux/sharedDefintion";

export type planningEntry = Omit<BasicGame, "genres" | "videoId" | "playlistId" | "releaseDate"> & {
    /** @description Still in progress or finished ? */
    status: "RECORDED" | "PENDING";
    /** @description When to display the game public, such as 20210412 (12/04/2021) */
    releaseDate?: number;
    /** @description When to display the game public, such as 20210420 (20/04/2021) */
    endDate?: number;
};

export async function GET() {

    // Game data
    const games = (await import("./planning.json")).default;
    
    return NextResponse.json(games.map(game => enhanceGameItem(game as BasicGame)), {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

// Turn "YYYY...MMDD" to int
function turnDateToInt(value: number | string | undefined) {
    if (value) {
        const { year, month, day } = (/(?<year>\d{4,})(?<month>\d{2})(?<day>\d{2})/.exec(value.toString()) as any).groups;
        // TODO one day, remove that & let PlanningColumn do the job
        return new Date(+year, Number(month) - 1, +day).getTime();
    } else {
        return undefined;
    }
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: BasicGame): planningEntry {
    return {
        id: (game as BasicPlaylist).playlistId ?? (game as BasicVideo).videoId,
        title: game.title,
        platform: game.platform,
        status:  (game.hasOwnProperty("endAt") ? "RECORDED" : "PENDING"),
        releaseDate: turnDateToInt(game?.availableAt),
        endDate: turnDateToInt(game?.endAt)
    }
}