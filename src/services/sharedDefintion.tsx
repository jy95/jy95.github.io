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
    // Technical identifier for React - by default : playlistId | videoId
    id: string,
    // Title of the game, such as "Beyond Good & Evil"
    title: string;
    // Playlist ID from Youtube, what you see after "playlist?list="
    playlistId?: string;
    // Video ID from Youtube - what you see after "watch?v="
    videoId?: string;
    // Platform for that game
    platform: Platform;
    // Duration of the walkthrough
    duration?: Duration;
    // Genres of the game
    genres: string[];
    // When the game was released, such "01/09/2005"
    releaseDate: string;
    // When to display the game public, such as 20210412 (12/04/2021)
    availableAt?: number;
    // When to display the game public, such as 20210420 (20/04/2021)
    endAt?: number;
    // Name of the main cover file, such as "cover.webp"
    coverFile?: string;
    // Does game has responsive images to offer
    hasResponsiveImages?: boolean;
}

// structured after parsing data/games.json
export interface EnhancedGame extends Omit<BasicGame, "releaseDate"> {
    // Folder containing responsive images
    imagesFolder?: string;
    // Link to the main picture (for the card components)
    imagePath: string;
    // When the game was released
    releaseDate: Date;
    // "duration" into something useful for sorting
    durationAsInt: number;
    // Link to Youtube
    url: string;
    // Type of Youtube link
    url_type: "PLAYLIST" | "VIDEO"
}