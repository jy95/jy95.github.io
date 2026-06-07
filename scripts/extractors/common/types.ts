
export interface Duration {
    hours: number;
    minutes: number;
    seconds: number;
}

// This interface represents a row in the "games_in_past" table of the database, which contains information about past games.
export interface PastGameRow {
    playlistId?: string | null;
    videoId: string;
    title: string;
    availableAt: string | number | Date;
    endAt?: string | null;
}