import { NextResponse } from "next/server";
import { buildCardEntry } from "@/redux/sharedDefintion";
import type { BasicGame, CardEntry } from "@/redux/sharedDefintion";

type rawEntry = Omit<BasicGame, "id">;
export type planningEntry = Omit<BasicGame, "videoId" | "playlistId"> & {
    /** @description Still in progress or finished ? */
    status: "RECORDED" | "PENDING";
    /** @description When to display the game public, such as 20210412 (12/04/2021) */
    startAt?: number;
    /** @description When to display the game public, such as 20210420 (20/04/2021) */
    finishAt?: number;
} & CardEntry;

export async function GET() {
    const games = (await import("./planning.json")).default;

    return NextResponse.json(games.map(enhanceGameItem), {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): planningEntry {
    const { id, url, url_type, imagePath, sourceKind } = buildCardEntry(game, "/covers", "planning");

    return {
        id,
        title: game.title,
        platform: game.platform,
        status: (game.hasOwnProperty("endAt") ? "RECORDED" : "PENDING"),
        imagePath,
        availableAt: game.availableAt,
        endAt: game.endAt,
        releaseDate: game.releaseDate,
        duration: game.duration,
        genres: game.genres,
        url,
        url_type,
        sourceKind
    }
}
