import {readFile, writeFile} from "node:fs/promises";

import {getPathname, routing} from "../../src/i18n/routing";

type Game = {title: string; videoId?: string | null; playlistId?: string | null};
type DlcGroup = {dlcs: readonly unknown[]};

export interface LlmContextData {
    staticPaths: readonly string[];
    games: readonly Game[];
    dlcs: readonly DlcGroup[];
    series: readonly unknown[];
    tests: readonly unknown[];
    backlog: readonly unknown[];
    planning: readonly unknown[];
}

export interface LlmContextSourcePaths {
    games: string;
    dlcs: string;
    series: string;
    tests: string;
    backlog: string;
    planning: string;
}

const PAGE_PURPOSES: Readonly<Record<string, string>> = {
    "/": "Browse the catalog homepage and featured gaming content.",
    "/games": "Browse all published games and walkthroughs.",
    "/games/series": "Browse published games grouped by series.",
    "/games/dlcs": "Browse published downloadable-content walkthroughs.",
    "/games/random": "Open a randomly selected published game.",
    "/planning": "See games planned for future publication.",
    "/backlog": "Browse games being considered for future walkthroughs.",
    "/tests": "Browse game tests and reviews.",
    "/stats": "View statistics about the published catalog.",
    "/tier": "Choose a GamesPassionFR tier-list collection.",
    "/tier/games": "View the ranking of published games.",
    "/tier/backlog": "View the ranking of backlog candidates.",
    "/tier/tests": "View the ranking of tested games.",
    "/links": "Find GamesPassionFR's external and social links.",
    "/video/:id": "Watch the YouTube video identified by id.",
    "/playlist/:id": "Watch the YouTube walkthrough playlist identified by id.",
};

const compareTitles = (left: Game, right: Game) => left.title < right.title ? -1 : left.title > right.title ? 1 : 0;

export function buildLlmContext(data: LlmContextData): string {
    const dlcTotal = data.dlcs.reduce((total, group) => total + group.dlcs.length, 0);
    const games = [...data.games].sort(compareTitles);

    return `# GamesPassionFR

GamesPassionFR is a bilingual French and English catalog for the GamesPassionFR YouTube gaming channel. It helps visitors discover published walkthroughs and tests, see planned games and backlog candidates, and browse the channel's rankings.

## Site pages

${data.staticPaths.map((path) => `- ${path}: ${PAGE_PURPOSES[path]}`).join("\n")}

## Current catalog

- Published games: ${data.games.length}
- Published DLCs: ${dlcTotal}
- Series: ${data.series.length}
- Tests: ${data.tests.length}
- Backlog candidates: ${data.backlog.length}
- Planned items: ${data.planning.length}

## Published games

The complete list below is alphabetical. \`playlistId\` identifies a YouTube playlist for a walkthrough; \`videoId\` identifies one YouTube video.

${games.map(({title, playlistId, videoId}) => playlistId
        ? `- ${title} (\`playlistId\`: ${playlistId})`
        : `- ${title} (\`videoId\`: ${videoId})`)
    .join("\n")}

## Feeds

- JSON Feed: /feed.json
- RSS Feed: /rss.xml

## Guidance for assistants

- Provide direct site paths when useful.
- Treat tests and tier lists as GamesPassionFR's opinions, not universal ratings.
- Distinguish published games from planned content and backlog candidates.
- Base answers about titles, rankings, schedules, or statistics on current site data; do not invent missing values.`;
}

async function readJson<T>(path: string): Promise<T> {
    return JSON.parse(await readFile(path, "utf-8")) as T;
}

export async function extractAndSaveLlmContext(
    outputPath: string,
    paths: LlmContextSourcePaths,
): Promise<void> {
    const staticPaths = Object.keys(routing.pathnames)
        .map((pathname) => getPathname({
            locale: routing.defaultLocale,
            href: pathname as Parameters<typeof getPathname>[0]["href"],
        }).replace("[id]", ":id"));
    const data: LlmContextData = {
        staticPaths,
        games: await readJson(paths.games),
        dlcs: await readJson(paths.dlcs),
        series: await readJson(paths.series),
        tests: await readJson(paths.tests),
        backlog: await readJson(paths.backlog),
        planning: await readJson(paths.planning),
    };

    await writeFile(outputPath, `${buildLlmContext(data)}\n`, "utf-8");
    console.log(`${outputPath} successfully written`);
}
