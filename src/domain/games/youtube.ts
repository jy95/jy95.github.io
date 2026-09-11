import type { RawGame, BasicPlaylist, BasicVideo, YTUrlType } from "./types";
import type { Href } from "@/i18n/routing";

type GameIdentity = {
    /** @description Unique identifier for the playlist or video */
    id: string;
    /** @description URL to the playlist or video */
    url: string;
    /** @description Type of the URL, either a playlist or a video */
    url_type: YTUrlType;
};

/**
 * Canonical (and only) place that decides whether a raw game record is a
 * YouTube playlist or a single video, and derives its id/url from that.
 * Every previous call site re-implemented this locally in an equivalent
 * form (`"playlistId" in game ? ... : ...` or `game.playlistId ?? game.videoId`).
 */
function isPlaylist(game: RawGame): game is Omit<BasicPlaylist, "genres" | "id"> {
    return 'playlistId' in game && typeof game.playlistId === 'string';
}

export function buildPlaylistUrl(playlistId: string): string {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}

export function buildVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

export function extractGameCardProps(game: RawGame): GameIdentity {
    const isPlaylistType = isPlaylist(game);
    const url_type: YTUrlType = isPlaylistType ? "PLAYLIST" : "VIDEO";

    const id = isPlaylistType
        ? game.playlistId
        : (game as Omit<BasicVideo, "genres" | "id">).videoId;

    const url = isPlaylistType ? buildPlaylistUrl(id) : buildVideoUrl(id);

    return { id, url, url_type };
}

export function buildWatchRoute(urlType: YTUrlType, id: string): Href {
    return {
        pathname: urlType === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
        params: { id }
    };
}