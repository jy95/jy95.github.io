import { NextResponse } from "next/server";
import { cachedJson } from "@/lib/http/cachedJson";
import { loadDlcGroups, toDlcDetail } from "../data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const group = (await loadDlcGroups()).find(entry => entry.id === id);
    if (!group) return NextResponse.json({ error: "DLC group not found" }, { status: 404 });
    return cachedJson(toDlcDetail(group));
}
