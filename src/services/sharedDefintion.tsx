type D1 = 0|1;
type D2 = D1|2;
type D3 = D2|3;
type D5 = D3|4|5;
type D9 = D5|6|7|8|9;
type D9_bis = 1|2|3|4|5|6|7|8|9;
type D12 = D9|10|11|12;

// TODO
// Currently only cover "00" to "9999"
// Should re-read https://github.com/microsoft/TypeScript/pull/40580 to understand
type Hours = `${D9}${D9}` | `${D9_bis}${D9}${D9}${D9 | ''}`;
type Minutes = `${D5}${D9}`;
type Seconds = `${D5}${D9}`;
// @ts-ignore
type Duration = `${Hours}:${Minutes}:${Seconds}`;

export type Platform = "PC" | "GBA" | "PSP" | "PS1" | "PS2" | "PS3" | string;

// structure used in data/games.json
export interface BasicGame {
    /** @description Technical identifier for React - by default : playlistId | videoId */
    id: string,
    /** @description Title of the game, such as "Beyond Good & Evil" */
    title: string;
    /** @description Playlist ID from Youtube, what you see after "playlist?list=" */
    playlistId?: string;
    /** @description Video ID from Youtube - what you see after "watch?v=" */
    videoId?: string;
    /** @description Platform for that game */
    platform: Platform;
    /** @description Duration of the walkthrough */
    duration?: Duration;
    /** @description Genres of the game */
    genres: string[];
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

// structured after parsing data/games.json
export interface EnhancedGame extends Omit<BasicGame, "releaseDate"> {
    /** @description Folder containing responsive images */
    imagesFolder?: string;
    /** @description Link to the main picture (for the card components) */
    imagePath: string;
    /** @description When the game was released (Date(2020, 02, 02).getTime()) */
    releaseDate: number;
    /** @description "duration" into something useful for sorting */
    durationAsInt: number;
    /** @description Link to Youtube */
    url: string;
    /** @description Type of Youtube link */
    url_type: "PLAYLIST" | "VIDEO"
}

// structure used for GameEntry and thus GameDialog
export interface CardGame extends Omit<BasicGame, "releaseDate" | "genres" | "platform"> {
    /** @description Link to Youtube */
    url: string;
    /** @description Type of Youtube link */
    url_type: "PLAYLIST" | "VIDEO";
    /** @description Folder containing responsive images */
    imagesFolder?: string;
    /** @description Link to the main picture (for the card components) */
    imagePath: string;
}