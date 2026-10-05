import type { RawGame, CardGame } from "@/domain/games";
import type { PaginationResponse } from "@/lib/http/pagination";

export type RawSeries = { id: number; name: string; items: (RawGame & { id: number })[] };
export type SeriesSummary = { id: number; name: string; imagePath: string; gamesCount: number };
export type SeriesDetail = SeriesSummary & { items: (CardGame & { tierCategory?: string | null })[] };
export type SeriesSort = "nameAsc" | "nameDesc" | "countAsc" | "countDesc";
export type SeriesListArgs = { filter: string; sort: SeriesSort; pageSize: number };
export type SeriesListResponse = PaginationResponse<SeriesSummary>;
