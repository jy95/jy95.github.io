import { NextResponse } from "next/server";

export async function GET() {

    // Game data
    const games = (await import("./games.json")).default;
    return NextResponse.json(games, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}