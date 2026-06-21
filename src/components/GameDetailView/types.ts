import type { BacklogEntry } from "@/app/api/backlog/route";
import type { CardGame } from "@/redux/sharedDefintion";

export type GameDetailsEntry = BacklogEntry | CardGame;

export type WithProperty<T, K extends PropertyKey, V> = T extends any
    ? K extends keyof T
        ? T & { [P in K]: V }
        : T & { [P in K]: V }
    : never;
