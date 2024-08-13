import { NextResponse } from "next/server";

export type Platform_Entry = {
    // Identifier
    id: number;
    // Database name, not translated by default
    name: string;
}
export type PlatformsResponse = Platform_Entry[];

export async function GET() {

    const platformsData = (await import("./platforms.json")).default;

    return NextResponse.json(platformsData, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}