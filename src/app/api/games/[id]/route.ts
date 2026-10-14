import { NextResponse } from "next/server";
import { cachedJson } from "@/lib/http/cachedJson";
import { resolveGameDetails } from "@/lib/gameDetails";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const details = await resolveGameDetails(id);
    if (!details) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    return cachedJson(details);
}