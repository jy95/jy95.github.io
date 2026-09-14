export interface Game {
    title: string;
    platform: number;
    videoId?: string | null;
    playlistId?: string | null;
}

export interface Platform {
    id: number;
    name: string;
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
    platforms: readonly Platform[];
    stats: Stats;
    backlog: readonly unknown[];
    planning: readonly unknown[];
}

export interface LlmContextSourcePaths {
    games: string;
    platforms: string;
    stats: string;
    backlog: string;
    planning: string;
}
