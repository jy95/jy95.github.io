import { NextResponse } from "next/server";
import { loadCompanies, toCompanyDetail } from "../data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const company = (await loadCompanies()).find((entry) => String(entry.id) === id);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    return NextResponse.json(await toCompanyDetail(company), {
        headers: { "Cache-Control": "public, max-age=86400, must-revalidate" },
    });
}
