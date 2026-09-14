import {getPathname, routing} from "@/i18n/routing";
import identifiers from "@/app/api/random/identifiers.json";

export const MAX_MEDIA_LINKS_PER_TYPE = 10;

type Identifier = {videoId?: string; playlistId?: string};

function localizedMediaPath(type: "video" | "playlist", id: string) {
    return getPathname({
        locale: routing.defaultLocale,
        href: {
            pathname: `/${type}/[id]`,
            params: {id},
        },
    });
}

export function buildMediaPages(items: readonly Identifier[] = identifiers) {
    const videoIds = items.flatMap(({videoId}) => videoId ? [videoId] : []);
    const playlistIds = items.flatMap(({playlistId}) => playlistId ? [playlistId] : []);
    const listedVideos = videoIds.slice(0, MAX_MEDIA_LINKS_PER_TYPE);
    const listedPlaylists = playlistIds.slice(0, MAX_MEDIA_LINKS_PER_TYPE);

    return `## Video and playlist pages

- Video pages: ${videoIds.length} total; showing up to ${MAX_MEDIA_LINKS_PER_TYPE}.
${listedVideos.map((id) => `  - ${localizedMediaPath("video", id)}`).join("\n")}
- Playlist pages: ${playlistIds.length} total; showing up to ${MAX_MEDIA_LINKS_PER_TYPE}.
${listedPlaylists.map((id) => `  - ${localizedMediaPath("playlist", id)}`).join("\n")}`;
}
