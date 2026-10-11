import type { CardGame } from "@/domain/games";
import type { PaginationResponse } from "@/lib/http/pagination";

export type DlcSummary = { id: string; name: string; imagePath: string; dlcsCount: number };
export type DlcDetail = DlcSummary & { items: CardGame[] };
export type DlcSort = "nameAsc" | "nameDesc" | "countAsc" | "countDesc";
export type DlcListArgs = { filter: string; sort: DlcSort; pageSize: number };
export type DlcListResponse = PaginationResponse<DlcSummary>;
