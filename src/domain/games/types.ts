// Domain types for game catalog data. Kept independent from Redux and Next.js routes.

export type BasicEntry = {
    /** Technical identifier for React - by default: playlistId | videoId */
    id: string;
    /** Title of the game */
    title: string;
    /** Platform for that game */
    platform: number;
    /** Duration of the walkthrough (e.g. "01:42:13") */
    duration?: string;
    /** Genres of the game */
    genres: number[];
    /** When the game was released */
    releaseDate?: string;
    /** When to display the game publicly */
    availableAt?: string;
    /** When to stop displaying the game publicly */
    endAt?: string;
    /** Name of the main cover file */
    coverFile?: string;
};

export type BasicVideo = BasicEntry & {
    /** Video ID from YouTube */
    videoId: string;
};

export type BasicPlaylist = BasicEntry & {
    /** Playlist ID from YouTube */
    playlistId: string;
};

export type BasicGame = BasicVideo | BasicPlaylist;
export type RawGame = Omit<BasicGame, "genres" | "id">;
export type YTUrlType = "PLAYLIST" | "VIDEO";

export interface BasicCard {
    /** Link to the picture for the card component */
    imagePath: string;
}

export type CardEntry = {
    /** Link to YouTube */
    url: string;
    /** Type of YouTube link */
    url_type: YTUrlType;
} & BasicCard;

/** Canonical shape for a game rendered as a card. */
export type CardGame = {
    id: string;
    title: string;
    duration?: string;
    platform?: number;
    genres?: number[];
    releaseDate?: string;
    availableAt?: string;
    endAt?: string;
    coverFile?: string;
} & CardEntry;
