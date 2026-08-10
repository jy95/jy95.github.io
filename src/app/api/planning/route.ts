import { NextResponse } from "next/server";
import { buildCardEntry } from "`@/redux/sharedDefintion`";
import type { BasicGame, CardGame } from "`@/redux/sharedDefintion`";

type rawEntry = Omit<BasicGame, "id">;

export type planningEntry = CardGame & {
    /** @description Still in progress or finished ? */
    status: "RECORDED" | "PENDING";
    /** @description When to display the game public, such as 20210412 (12/04/2021) */
    startAt?: number;
    /** @description When to display the game public, such as 20210420 (20/04/2021) */
    finishAt?: number;
};

export async function GET() {
    const games = (await import("./planning.json")).default;

    return NextResponse.json(games.map(enhanceGameItem), {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}

function enhanceGameItem(game: rawEntry): planningEntry {
    return {
        ...game,
        ...buildCardEntry(game, "/covers", "planning"),
        status: Object.hasOwn(game, "endAt") ? "RECORDED" : "PENDING"
    };
}
