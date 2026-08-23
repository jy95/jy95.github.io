import type { YTUrlType } from "@/domain/games";

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
