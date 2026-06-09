import { NextResponse } from "next/server";

export async function GET() {

    // Backlog data
    const backlog = (await import("./backlog.json")).default;
    return NextResponse.json(backlog, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}