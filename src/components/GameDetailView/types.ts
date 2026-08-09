import type { YTUrlType } from "@/redux/sharedDefintion";

/**
 * Canonical, flattened shape consumed by GameDetailView and its row
 * components. Both `BacklogEntry` and `CardGame` (or anything structurally
 * compatible with them, e.g. `planningEntry`) are normalized into this
 * shape via `toGameDetailsEntry` in `adapters.ts`, so row components never
 * need to type-guard a union — every field below is a plain optional on a
 * single concrete type.
 */
export interface GameDetailsEntry {
    id: string;
    title: string;
    imagePath: string;
    platform?: number;
    genres?: number[];
    releaseDate?: string;
    duration?: string;
    hltb_main?: string;
    hltb_extra?: string;
    hltb_completionist?: string;
    notes?: string;
    url?: string;
    url_type?: YTUrlType;
}