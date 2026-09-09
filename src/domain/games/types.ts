/**
 * Canonical game-domain types.
 *
 * This module owns the shape of "a game as stored in our data files" and
 * must never depend on React, Next.js, Redux, or any API route
 * implementation. Consumers (API routes, Redux, features) depend on this
 * module — never the other way around.
 *
 * Moved out of `src/redux/sharedDefintion.tsx`, which was the wrong owner:
 * Redux should hold *application state*, not the canonical shape of a game.
 */

export type BasicEntry = {
    /** @description Technical identifier for React - by default : playlistId | videoId */
    id: string,
    /** @description Title of the game, such as "Beyond Good & Evil" */
    title: string;
    /** @description Platform for that game */
    platform: number;
    /** @description Duration of the walkthrough (e.g. "01:42:13") */
    duration?: string;
    /** @description Genres of the game */
    genres: number[];
    /** @description When the game was released, such "2005-12-22" */
    releaseDate?: string;
    /** @description When to display the game public, such as "2021-12-22" */
    availableAt?: string;
    /** @description When to display the game public, such as "2024-07-22" */
    endAt?: string;
    /** @description Name of the main cover file, such as "cover.webp" */
    coverFile?: string;
}

export type BasicVideo = BasicEntry & {
    /** @description Unique identifier for the video */
    videoId: string;
}

export type BasicPlaylist = BasicEntry & {
    /** @description Unique identifier for the playlist */
    playlistId: string;
}

export type BasicGame = BasicVideo | BasicPlaylist;
export type RawGame = Omit<BasicGame, "genres" | "id">;

export type YTUrlType = 'PLAYLIST' | 'VIDEO';

export interface BasicCard {
    /** @description Path to the image file */
    imagePath: string;
}

export type CardEntry = {
    /** @description The URL for the video or playlist */
    url: string;
    /** @description The type of the URL */
    url_type: YTUrlType;
} & BasicCard;

export type CardGame = {
    /** @description Technical identifier for React - by default : playlistId | videoId */
    id: string;
    /** @description Title of the game, such as "Beyond Good & Evil" */
    title: string;
    /** @description Duration of the walkthrough (e.g. "01:42:13") */
    duration?: string;
    /** @description Platform for that game */
    platform?: number;
    /** @description Genres of the game */
    genres?: number[];
    /** @description When the game was released, such "2005-12-22" */
    releaseDate?: string;
    /** @description When to display the game public, such as "2021-12-22" */
    availableAt?: string;
    /** @description When to display the game public, such as "2024-07-22" */
    endAt?: string;
    /** @description Name of the main cover file, such as "cover.webp" */
    coverFile?: string;
} & CardEntry;