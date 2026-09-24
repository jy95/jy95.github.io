import { NextResponse } from "next/server";
import { loadCompanies, toCompanySummary } from "./data";
import type { CompanyRole, CompanySummary } from "./data";

export type { CompanyType, CompanyGame, CompanySummary, CompanyRole } from "./data";
export type CompanySort = "nameAsc" | "nameDesc" | "countDesc" | "countAsc";

export type ResponseBody = {
    items: CompanySummary[];
    total_items: number;
    total_pages: number;
    pageSize: number;
    page: number;
};

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const roleParam = params.get("role");
    const role: CompanyRole = roleParam === "developer" || roleParam === "publisher" ? roleParam : "all";
    const sortParam = params.get("sort");
    // Missing or unknown sort values default to name ascending.
    const sort: CompanySort = sortParam === "nameDesc" || sortParam === "countDesc" || sortParam === "countAsc" ? sortParam : "nameAsc";
    const parsePositive = (value: string | null, fallback: number) => {
        const number = Number(value);
        return Number.isSafeInteger(number) && number > 0 ? number : fallback;
    };
    const page = parsePositive(params.get("page"), 1);
    const pageSize = Math.min(parsePositive(params.get("pageSize"), 12), 100);
    const summaries = (await loadCompanies()).map((company) => toCompanySummary(company, role))
        .filter((company) => company.gamesCount > 0)
        .sort((first, second) => {
            const nameOrder = first.name.localeCompare(second.name) || first.id - second.id;
            if (sort === "nameDesc") return second.name.localeCompare(first.name) || first.id - second.id;
            if (sort === "countDesc") return second.gamesCount - first.gamesCount || nameOrder;
            if (sort === "countAsc") return first.gamesCount - second.gamesCount || nameOrder;
            return nameOrder;
        });

    const response: ResponseBody = {
        items: summaries.slice((page - 1) * pageSize, page * pageSize),
        total_items: summaries.length,
        total_pages: Math.ceil(summaries.length / pageSize),
        pageSize,
        page,
    };
    return NextResponse.json(response, {
        headers: { "Cache-Control": "public, max-age=86400, must-revalidate" },
    });
}
