import { NextResponse } from "next/server";

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
    const game : RandomAnswer = {
        "identifier": entry.playlistId ?? entry.videoId,
        "type": ("videoId" in entry) ? "VIDEO" : "PLAYLIST"
    }

    return NextResponse.json(game)
}