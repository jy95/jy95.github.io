import type { YTUrlType } from "@/redux/sharedDefintion";

/**
 * Canonical, flattened shapes consumed by GameDetailView and its row
 * components. Both `BacklogEntry` and `CardGame` (or anything structurally
 * compatible with them, e.g. `planningEntry`) are normalized into one of
 * these two shapes via `toGameDetailsEntry` in `adapters.ts`.
 *
 * This is a discriminated union rather than a flat "everything optional"
 * type: a backlog entry can never have `genres`/`duration`/`releaseDate`,
 * and a card entry can never have `hltb_*`/`notes`. Modeling that at the
 * type level means the compiler — not a runtime predicate — rejects
 * accessing a field that can't exist for a given `kind`, and predicates.ts
 * no longer has to guess which fields "belong" to which source.
 */
interface BaseGameDetailsEntry {
    id: string;
    title: string;
    imagePath: string;
    platform?: number;
}

export interface CardKindEntry extends BaseGameDetailsEntry {
    kind: "card";
    genres?: number[];
    releaseDate?: string;
    duration?: string;
    url: string;
    url_type: YTUrlType;
}

export interface BacklogKindEntry extends BaseGameDetailsEntry {
    kind: "backlog";
    notes?: string;
    hltb_main?: string;
    hltb_extra?: string;
    hltb_completionist?: string;
}

export type GameDetailsEntry = CardKindEntry | BacklogKindEntry;