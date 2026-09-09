import { NextResponse } from "next/server";
import { buildCardGame } from "@/domain/games";
import type { BasicGame, CardGame } from "@/domain/games";

type rawEntry = Omit<BasicGame, "id">;

/**
 * A planning entry is the canonical CardGame representation *plus*
 * planning-specific fields. It must not re-declare id/title/platform/
 * genres/releaseDate/duration/url/url_type/imagePath — those already come
 * from CardGame via buildCardGame().
 */
export type planningEntry = CardGame & {
    /** @description Still in progress or finished ? */
    status: "RECORDED" | "PENDING";
};

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
    return {
        ...buildCardGame(game as BasicGame, "/covers"),
        status: Object.hasOwn(game, "endAt") ? "RECORDED" : "PENDING"
    };
}