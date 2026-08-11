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
export interface BasicCard {
    /** @description Link to the picture for the card component */
    imagePath: string;
}

// structure for Card entry
export type CardEntry = {
    /** @description Link to Youtube */
    url: string;
    /** @description Type of Youtube link */
    url_type: YTUrlType;
} & BasicCard;

/**
 * Canonical shape for a game rendered as a card (game listings, series,
 * dlcs, tests, tier lists, planning). Every field beyond id/title/CardEntry
 * is optional because different sources populate different subsets of it
 * (a dlc has no genres/platform, a planning entry has all of them, etc).
 *
 * NOTE: this used to be `interface CardGame extends Omit<BasicGame,
 * "releaseDate" | "genres" | "platform">, CardEntry {}`. Extending a union
 * (`BasicGame`) via `Omit` collapses `keyof BasicGame` down to the keys
 * *common* to both `BasicVideo` and `BasicPlaylist`, and then the Omit list
 * additionally stripped genres/platform/releaseDate from the type entirely
 * — even though every route attaches them on the actual returned object.
 * That mismatch is what forced GameDetailView's `hasKey`/`WithProperty`
 * guard machinery to exist. Declaring the fields as plain optionals here
 * removes the need for that machinery (see GameDetailView/predicates.ts).
 */
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

interface GameProps {
    id: string;
    url: string;
    url_type: YTUrlType;
}

// 🎯 User-Defined Type Guard
function isPlaylist(game: RawGame): game is Omit<BasicPlaylist, "genres" | "id"> {
    return 'playlistId' in game && typeof game.playlistId === 'string';
}

export function extractGameCardProps(game: RawGame): GameProps {
    const isPlaylistType = isPlaylist(game);
    const url_type: YTUrlType = isPlaylistType ? "PLAYLIST" : "VIDEO";

    const id = isPlaylistType ? game.playlistId : (game as Omit<BasicVideo, "genres" | "id">).videoId;
    const url = isPlaylistType 
            ? `https://www.youtube.com/playlist?list=${id}` 
            : `https://www.youtube.com/watch?v=${id}`;

    return {
        id,
        url,
        url_type
    }
}

/**
 * Builds the CardEntry portion (id/url/url_type/imagePath) shared by every
 * "list of games" API route. `coversBasePath` lets each route point at its
 * own public folder (e.g. "/covers" vs "/testscovers") while keeping the
 * id/url derivation and coverFile fallback logic in exactly one place.
 *
 * Previously this logic was reimplemented — each slightly differently — in
 * games/route.ts, tests/route.ts, series/route.ts, dlcs/route.ts and
 * planning/route.ts.
 */
export function buildCardEntry(game: RawGame, coversBasePath: string): CardEntry & { id: string } {
    const { id, url, url_type } = extractGameCardProps(game);
    return {
        id,
        url,
        url_type,
        imagePath: `${coversBasePath}/${id}/${game.coverFile ?? "cover.webp"}`
    };
}
