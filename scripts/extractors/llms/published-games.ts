import type {Game} from "./types";

const compareTitles = (left: Game, right: Game): number =>
    left.title < right.title ? -1 : left.title > right.title ? 1 : 0;

const youtubeUrl = ({playlistId, videoId}: Game): string => playlistId
    ? `https://www.youtube.com/playlist?list=${playlistId}`
    : `https://www.youtube.com/watch?v=${videoId ?? ""}`;

export function renderPublishedGames(sourceGames: readonly Game[]): string {
    const games = [...sourceGames].sort(compareTitles);

    return `## Published games

The complete list below is alphabetical.

${games.map((game) => `- [${game.title}](${youtubeUrl(game)})`).join("\n")}`;
}
