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
 * Source kind discriminant — lets callers know what source a CardGame came from.
 * This is a small, additive discriminant that can be extended into a full
 * discriminated union later if you want to model every source precisely.
 */
export type SourceKind = 'game' | 'dlc' | 'series' | 'planning' | 'test';

// Canonical shape for a game rendered as a card
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
    /** Small discriminant telling callers where this item originates from */
    sourceKind?: SourceKind;
} & CardEntry;

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
export function buildCardEntry(game: RawGame, coversBasePath: string, sourceKind: SourceKind = 'game'): CardEntry & { id: string, sourceKind: SourceKind } {
    const { id, url, url_type } = extractGameCardProps(game);
    return {
        id,
        url,
        url_type,
        imagePath: `${coversBasePath}/${id}/${game.coverFile ?? "cover.webp"}`,
        sourceKind
    };
}
