export interface Game {
    title: string;
    videoId?: string | null;
    playlistId?: string | null;
}

export interface Duration {
    hours?: number;
    minutes?: number;
    seconds?: number;
}

export interface Stats {
    general?: {
        games?: {total?: number; total_available?: number};
        duration?: {total?: Duration; total_available?: Duration};
    };
}

export interface LlmContextData {
    staticPaths: readonly string[];
    games: readonly Game[];
    stats: Stats;
    backlog: readonly unknown[];
    planning: readonly unknown[];
}

export interface LlmContextSourcePaths {
    games: string;
    stats: string;
    backlog: string;
    planning: string;
}
