export type Platform = "PC" | "GBA" | "PSP" | "PS1" | "PS2" | "PS3";

export const genre_list = [
    "Action",
    "Adventure",
    "Arcade",
    "Board Games",
    "Card",
    "Casual",
    "Educational",
    "Family",
    "Fighting",
    "Indie",
    "MMORPG",
    "Platformer",
    "Puzzle",
    "RPG",
    "Racing",
    "Shooter",
    "Simulation",
    "Sports",
    "Strategy",
    "Misc"
] as const;
export type Genre = typeof genre_list[number];

// structure used in data/games.json
interface BasicEntry {
    /** @description Technical identifier for React - by default : playlistId | videoId */
    id: string,
    /** @description Title of the game, such as "Beyond Good & Evil" */
    title: string;
    /** @description Platform for that game */
    platform: Platform;
    /** @description Duration of the walkthrough (e.g. "01:42:13") */
    duration?: string;
    /** @description Genres of the game */
    genres: Genre[];
    /** @description When the game was released, such "01/09/2005" */
    releaseDate: string;
    /** @description When to display the game public, such as 20210412 (12/04/2021) */
    availableAt?: number;
    /** @description When to display the game public, such as 20210420 (20/04/2021) */
    endAt?: number;
    /** @description Name of the main cover file, such as "cover.webp" */
    coverFile?: string;
    /** @description Does game has responsive images to offer */
    hasResponsiveImages?: boolean;
}

export interface BasicVideo extends BasicEntry {
    /** @description Video ID from Youtube - what you see after "watch?v=" */
    videoId: string;
}

export interface BasicPlaylist extends BasicEntry {
    /** @description Playlist ID from Youtube, what you see after "playlist?list=" */
    playlistId: string;
}

// structure used in data/games.json
export type BasicGame = BasicVideo | BasicPlaylist;

// structure for Card entry
interface CardEntry {
    /** @description Link to the main picture (for the card components) */
    imagePath: string;
    /** @description Responsive images */
    srcSet?: string;
    /** @description Responsive sizes */
    sizes?: string;
    /** @description Link to Youtube */
    url: string;
    /** @description Type of Youtube link */
    url_type: 'PLAYLIST' | 'VIDEO';
};

// structured after parsing data/games.json
export interface EnhancedGame extends Omit<BasicGame, "releaseDate">, CardEntry {
    /** @description When the game was released (Date(2020, 02, 02).getTime()) */
    releaseDate: number;
    /** @description "duration" into something useful for sorting */
    durationAsInt: number;
};

// structure used for GameEntry and thus GameDialog
export interface CardGame extends Omit<BasicGame, "releaseDate" | "genres" | "platform">, CardEntry {};