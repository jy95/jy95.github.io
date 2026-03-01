import { NextResponse } from "next/server";
import { extractGameCardProps } from "@/redux/sharedDefintion";
import type { BasicGame, CardEntry } from "@/redux/sharedDefintion";

type rawEntry = Omit<BasicGame, "genres" | "id" >;
export type planningEntry = Omit<BasicGame, "genres" | "videoId" | "playlistId"> & {
    /** @description Still in progress or finished ? */
    status: "RECORDED" | "PENDING";
    /** @description When to display the game public, such as 20210412 (12/04/2021) */
    startAt?: number;
    /** @description When to display the game public, such as 20210420 (20/04/2021) */
    finishAt?: number;
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

// Return an enhanced payload for a single game
function enhanceGameItem(game: rawEntry): planningEntry {

    const metadata = extractGameCardProps(game);

    return {
        id: metadata.id,
        title: game.title,
        platform: game.platform,
        status:  (game.hasOwnProperty("endAt") ? "RECORDED" : "PENDING"),
        imagePath: `/covers/${metadata.id}/${game.coverFile ?? "cover.webp"}`,
        availableAt: game.availableAt,
        endAt: game.endAt,
        releaseDate: game.releaseDate,
        url: metadata.url,
        url_type: metadata.url_type
    }
}