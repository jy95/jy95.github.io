import { parsePageParams, paginate } from "@/lib/http/pagination";
import { cachedJson } from "@/lib/http/cachedJson";
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
    const pagination = parsePageParams(params);
    const summaries = (await loadCompanies()).map((company) => toCompanySummary(company, role))
        .filter((company) => company.gamesCount > 0)
        .sort((first, second) => {
            const nameOrder = first.name.localeCompare(second.name) || first.id - second.id;
            if (sort === "nameDesc") return second.name.localeCompare(first.name) || first.id - second.id;
            if (sort === "countDesc") return second.gamesCount - first.gamesCount || nameOrder;
            if (sort === "countAsc") return first.gamesCount - second.gamesCount || nameOrder;
            return nameOrder;
        });

    const response: ResponseBody = paginate(summaries, pagination);
    return cachedJson(response);
}
