import { NextResponse } from "next/server";

type statsEntry = {
    /** @description  Number of games for this stat (including not yet available ones) */
    total: number,
    /** @description  Number of games for this stat (only available ones) */
    total_available: number,
    /** @description  Number of games for this stat (only unavailable ones) */
    total_unavailable: number    
}

type contentDuration = {
    hours: number,
    minutes: number,
    seconds: number
}

// For extraneous properties in "general"
type statsGeneral = {
    // Info can be found in Youtube RSS feed
    "channel_start_date": string,
    // Number of games
    "games": statsEntry,
    // Number of dlc
    "dlcs": statsEntry,
    // duration of content (games / dlc)
    "duration": {
        "total": contentDuration,
        "total_available": contentDuration,
        "total_unavailable": contentDuration,
    }
}

// For specifc stats
type platformStats = statsEntry & {
    id: number,
    platform: string
}
type genreStats = statsEntry & {
    id: number,
    genre: string
}

export type statsProperty = {
    /** @description  Stats about platforms covered */
    platforms: platformStats[],
    /** @description  Stats about genres covered */
    genres: genreStats[],
    /** @description  General stats */
    general: statsGeneral
};

export async function GET() {

    const statsData = (await import("./stats.json")).default;

    return NextResponse.json(statsData, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}