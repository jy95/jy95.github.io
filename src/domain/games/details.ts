import type { BasicCard, CardGame } from "./types";

export type PlanningEntry = CardGame & {
    status: "RECORDED" | "PENDING";
};

export type BacklogEntry = BasicCard & {
    id: string;
    title: string;
    platform?: number;
    notes?: string;
    hltb_main?: string;
    hltb_extra?: string;
    hltb_completionist?: string;
};

export type GameDetailsResponse =
    | { source: "published"; game: CardGame }
    | { source: "planning"; game: PlanningEntry }
    | { source: "backlog"; game: BacklogEntry };
