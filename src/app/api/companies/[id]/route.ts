import { NextResponse } from "next/server";
import { cachedJson } from "@/lib/http/cachedJson";
import { loadCompanies, toCompanyDetail } from "../data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const company = (await loadCompanies()).find((entry) => String(entry.id) === id);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    return cachedJson(await toCompanyDetail(company));
}
