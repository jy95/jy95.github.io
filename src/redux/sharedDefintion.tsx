// structure used in data/games.json
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
    /** @description Video ID from Youtube - what you see after "watch?v=" */
    videoId: string;
}

export type BasicPlaylist = BasicEntry & {
    /** @description Playlist ID from Youtube, what you see after "playlist?list=" */
    playlistId: string;
}

// structure used in data/games.json
export type BasicGame = BasicVideo | BasicPlaylist;
// structure used in data/dlcs.json & data/tests.json
export type RawGame = Omit<BasicGame, "genres" | "id">;

// Type of Youtube link 
export type YTUrlType = 'PLAYLIST' | 'VIDEO';

// structure for Card entry
interface CardEntry {
    /** @description Link to the picture for the card component */
    imagePath: string;
    /** @description Link to Youtube */
    url: string;
    /** @description Type of Youtube link */
    url_type: YTUrlType;
};

// structure used for GameEntry and thus GameDialog
export interface CardGame extends Omit<BasicGame, "releaseDate" | "genres" | "platform">, CardEntry {};

interface GameProps {
    id: string;
    url: string;
    url_type: YTUrlType;
}

// 🎯 User-Defined Type Guard
function isPlaylist(game: RawGame): game is Omit<BasicPlaylist, "genres" | "id"> {
    return 'playlistId' in game;
}

export function extractGameCardProps(game: RawGame): GameProps {
    
    const isPlaylistType = isPlaylist(game);
    const url_type: YTUrlType = isPlaylistType ? "PLAYLIST" : "VIDEO";
    const id: string = isPlaylist(game) ? game.playlistId : (game as Omit<BasicVideo, "genres" | "id">).videoId;

    return {
        id,
        url: isPlaylistType ? `https://www.youtube.com/playlist?list=${id}` : `https://www.youtube.com/watch?v=${id}`,
        url_type
    }
}