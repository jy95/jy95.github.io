import { cachedJson } from "@/lib/http/cachedJson";
import { paginate, parsePageParams } from "@/lib/http/pagination";
import { compareDlcs, DLC_SORT_OPTIONS } from "@/domain/dlcs/sorting";
import { loadDlcGroups, toDlcSummary } from "./data";

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const filter = (params.get("filter") ?? "").trim().toLocaleLowerCase();
    const sort = DLC_SORT_OPTIONS.find(option => option === params.get("sort")) ?? "nameAsc";
    const summaries = (await loadDlcGroups()).map(toDlcSummary)
        .filter(group => group.name.toLocaleLowerCase().includes(filter))
        .sort((first, second) => compareDlcs(first, second, sort));
    return cachedJson(paginate(summaries, parsePageParams(params)));
}
