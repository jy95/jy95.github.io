import type { BasicPlaylist, BasicVideo, CardEntry, RawGame, YTUrlType } from "./types";

type GameProps = {
    id: string;
    url: string;
    url_type: YTUrlType;
};

function isPlaylist(game: RawGame): game is Omit<BasicPlaylist, "genres" | "id"> {
    return "playlistId" in game && typeof game.playlistId === "string";
}

export function extractGameCardProps(game: RawGame): GameProps {
    const isPlaylistType = isPlaylist(game);
    const url_type: YTUrlType = isPlaylistType ? "PLAYLIST" : "VIDEO";
    const id = isPlaylistType
        ? game.playlistId
        : (game as Omit<BasicVideo, "genres" | "id">).videoId;
    const url = isPlaylistType
        ? `https://www.youtube.com/playlist?list=${id}`
        : `https://www.youtube.com/watch?v=${id}`;

    return { id, url, url_type };
}

/** Builds the CardEntry shared by game-list API routes. */
export function buildCardEntry(game: RawGame, coversBasePath: string): CardEntry & { id: string } {
    const { id, url, url_type } = extractGameCardProps(game);

    return {
        id,
        url,
        url_type,
        imagePath: `${coversBasePath}/${id}/${game.coverFile ?? "cover.webp"}`,
    };
}
