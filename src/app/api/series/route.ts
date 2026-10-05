import { cachedJson } from "@/lib/http/cachedJson";
import { paginate, parsePageParams } from "@/lib/http/pagination";
import { compareSeries, SERIES_SORT_OPTIONS } from "@/domain/series/sorting";
import { loadSeries, toSeriesSummary } from "./data";

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const filter = (params.get("filter") ?? "").trim().toLocaleLowerCase();
    const sort = SERIES_SORT_OPTIONS.find(option => option === params.get("sort")) ?? "nameAsc";
    const summaries = (await loadSeries()).map(toSeriesSummary)
        .filter(series => series.name.toLocaleLowerCase().includes(filter))
        .sort((first, second) => compareSeries(first, second, sort));
    return cachedJson(paginate(summaries, parsePageParams(params)));
}
