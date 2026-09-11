import { NextResponse } from "next/server";
import { extractGameCardProps } from "@/domain/games";

import type { RawGame } from "@/domain/games/types";

export type RandomAnswer = {
    "identifier": string;
    "type": "PLAYLIST" | "VIDEO"
}

export async function GET() {
    
    // Fetch game data
    const gamesData = (await import("./identifiers.json")).default;
    const size = gamesData.length;

    // pick up a game randomly
    const index = Math.floor(Math.random() * size);
    const entry = gamesData[index];

    // map it to understandable structure
    const { id, url_type } = extractGameCardProps(entry as RawGame);
    const game : RandomAnswer = {
        "identifier": id,
        "type": url_type
    }

    return NextResponse.json(game)
}