import { NextResponse } from "next/server";

export type Genre = {
    // identifier
    id: number;
    // untraslated name
    name: string;
}
export type GenreResponse = Genre[];

export async function GET() {

    const genresData = (await import("./genres.json")).default;

    return NextResponse.json(genresData, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}