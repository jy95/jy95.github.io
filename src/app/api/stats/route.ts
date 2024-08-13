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
type statsGeneral = statsEntry & {
    // Info can be found in Youtube RSS feed
    "channel_start_date": string,
    "total_time": contentDuration,
    "total_time_available": contentDuration,
    "total_time_unavailable": contentDuration,
}

export type statsProperty = {
    /** @description  Stats about platforms covered */
    platforms: statsEntry[],
    /** @description  Stats about genres covered */
    genres: statsEntry[],
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