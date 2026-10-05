import { NextResponse } from "next/server";
import { cachedJson } from "@/lib/http/cachedJson";
import { loadSeries, toSeriesDetail } from "../data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const series = (await loadSeries()).find(entry => String(entry.id) === id);
    if (!series) return NextResponse.json({ error: "Series not found" }, { status: 404 });
    return cachedJson(await toSeriesDetail(series));
}
