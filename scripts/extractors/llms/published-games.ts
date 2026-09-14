import type {Game, Platform} from "./types";

const compareTitles = (left: Game, right: Game): number =>
    left.title < right.title ? -1 : left.title > right.title ? 1 : 0;

const youtubeUrl = ({playlistId, videoId}: Game): string => playlistId
    ? `https://www.youtube.com/playlist?list=${playlistId}`
    : `https://www.youtube.com/watch?v=${videoId ?? ""}`;

export function renderPublishedGames(sourceGames: readonly Game[], platforms: readonly Platform[]): string {
    const games = [...sourceGames].sort(compareTitles);
    const duplicateTitles = new Set(games
        .filter((game, index) => games.some((candidate, candidateIndex) =>
            candidateIndex !== index && candidate.title === game.title,
        ))
        .map(({title}) => title));
    const platformNames = new Map(platforms.map(({id, name}) => [id, name]));

    return `## Published games

The complete list below is alphabetical.

${games.map((game) => {
        const platformName = duplicateTitles.has(game.title) ? platformNames.get(game.platform) : undefined;
        const label = platformName ? `${game.title} (${platformName})` : game.title;
        return `- [${label}](${youtubeUrl(game)})`;
    }).join("\n")}`;
}
