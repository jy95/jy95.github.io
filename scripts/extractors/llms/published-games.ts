import { buildPlaylistUrl, buildVideoUrl } from "@/domain/games";
import { renderSection } from "./markdown";
import type { Game, Platform } from "./types";

const compareTitles = (left: Game, right: Game): number =>
    left.title < right.title ? -1 : left.title > right.title ? 1 : 0;

const youtubeUrl = ({ playlistId, videoId }: Game): string =>
    playlistId ? buildPlaylistUrl(playlistId) : buildVideoUrl(videoId ?? "");

function findDuplicateTitles(games: readonly Game[]): Set<string> {
    const counts = new Map<string, number>();
    for (const { title } of games) {
        counts.set(title, (counts.get(title) ?? 0) + 1);
    }
    return new Set([...counts].filter(([, count]) => count > 1).map(([title]) => title));
}

export function renderPublishedGames(sourceGames: readonly Game[], platforms: readonly Platform[]): string {
    const games = [...sourceGames].sort(compareTitles);
    const duplicateTitles = findDuplicateTitles(games);
    const platformNames = new Map(platforms.map(({ id, name }) => [id, name]));

    const lines = games.map((game) => {
        const platformName = duplicateTitles.has(game.title) ? platformNames.get(game.platform) : undefined;
        const label = platformName ? `${game.title} (${platformName})` : game.title;
        return `- [${label}](${youtubeUrl(game)})`;
    });

    return `${renderSection("Published games", "The complete list below is alphabetical.")}\n\n${lines.join("\n")}`;
}