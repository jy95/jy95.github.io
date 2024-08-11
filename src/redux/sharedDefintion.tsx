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
export type BasicEntry = {
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
}

export type BasicVideo = BasicEntry & {
    /** @description Video ID from Youtube - what you see after "watch?v=" */
    videoId: string;
}

export type BasicPlaylist = BasicEntry & {
    /** @description Playlist ID from Youtube, what you see after "playlist?list=" */
    playlistId: string;
}

// structure used in data/games.json
export type BasicGame = BasicVideo | BasicPlaylist;
// Type of Youtube link 
export type YTUrlType = 'PLAYLIST' | 'VIDEO';

// structure for Card entry
interface CardEntry {
    /** @description Link to the picture for the card component */
    imagePath: string;
    /** @description Responsive sizes */
    sizes?: string;
    /** @description Link to Youtube */
    url: string;
    /** @description Type of Youtube link */
    url_type: YTUrlType;
};

// structure used for GameEntry and thus GameDialog
export interface CardGame extends Omit<BasicGame, "releaseDate" | "genres" | "platform">, CardEntry {};