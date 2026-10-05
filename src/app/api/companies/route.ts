import { parsePageParams, paginate } from "@/lib/http/pagination";
import { cachedJson } from "@/lib/http/cachedJson";
import { loadCompanies, toCompanySummary } from "./data";
import type { CompanyRole, CompanySummary } from "./data";

export type { CompanyType, CompanyGame, CompanySummary, CompanyRole } from "./data";

const COMPANY_SORTS = ["nameAsc", "nameDesc", "countDesc", "countAsc"] as const;
export type CompanySort = (typeof COMPANY_SORTS)[number];

export type ResponseBody = {
    items: CompanySummary[];
    total_items: number;
    total_pages: number;
    pageSize: number;
    page: number;
};

type Comparator = (first: CompanySummary, second: CompanySummary) => number;

const byNameThenId: Comparator = (a, b) => a.name.localeCompare(b.name) || a.id - b.id;

// Count sorts fall back to name order, then id, so pagination is stable.
const COMPARATORS: Record<CompanySort, Comparator> = {
    nameAsc: byNameThenId,
    nameDesc: (a, b) => b.name.localeCompare(a.name) || a.id - b.id,
    countDesc: (a, b) => b.gamesCount - a.gamesCount || byNameThenId(a, b),
    countAsc: (a, b) => a.gamesCount - b.gamesCount || byNameThenId(a, b),
};

const ROLES = ["developer", "publisher"] as const;

const parseRole = (value: string | null): CompanyRole =>
    ROLES.find((role) => role === value) ?? "all";

// Missing or unknown sort values default to name ascending.
const parseSort = (value: string | null): CompanySort =>
    COMPANY_SORTS.find((sort) => sort === value) ?? "nameAsc";

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const role = parseRole(params.get("role"));
    const sort = parseSort(params.get("sort"));

    const summaries = (await loadCompanies())
        .map((company) => toCompanySummary(company, role))
        .filter((company) => company.gamesCount > 0)
        .sort(COMPARATORS[sort]);

    const response: ResponseBody = paginate(summaries, parsePageParams(params));
    return cachedJson(response);
}
