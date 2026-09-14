import {readFile, writeFile} from "node:fs/promises";

import {getPathname, routing} from "../../src/i18n/routing";

export const MAX_MEDIA_PATHS_PER_TYPE = 10;
export const MAX_RECENT_FEED_ENTRIES = 5;

type Identifier = {videoId?: string | null; playlistId?: string | null};
type TierList = Record<string, readonly unknown[]>;
type Feed = {items: readonly {title: string; url?: string}[]};

export interface LlmContextData {
    staticPaths: readonly string[];
    identifiers: readonly Identifier[];
    games: readonly unknown[];
    tests: readonly unknown[];
    backlog: readonly unknown[];
    planning: readonly unknown[];
    gameTiers: TierList;
    backlogTiers: TierList;
    testTiers: TierList;
    feed: Feed;
}

export interface LlmContextSourcePaths {
    identifiers: string;
    games: string;
    tests: string;
    backlog: string;
    planning: string;
    gameTiers: string;
    backlogTiers: string;
    testTiers: string;
    feed: string;
}

const tierTotal = (tiers: TierList) => Object.values(tiers)
    .reduce((total, entries) => total + entries.length, 0);

export function buildLlmContext(data: LlmContextData): string {
    const videoIds = data.identifiers.flatMap(({videoId}) => videoId ? [videoId] : []);
    const playlistIds = data.identifiers.flatMap(({playlistId}) => playlistId ? [playlistId] : []);
    const videos = videoIds.slice(0, MAX_MEDIA_PATHS_PER_TYPE);
    const playlists = playlistIds.slice(0, MAX_MEDIA_PATHS_PER_TYPE);
    const recentEntries = data.feed.items.slice(0, MAX_RECENT_FEED_ENTRIES);

    return `# GamesPassionFR

GamesPassionFR is a bilingual French and English catalog for the GamesPassionFR YouTube gaming channel. It helps visitors discover published playthroughs and tests, see planned games and backlog candidates, and browse the channel's rankings.

## Site pages

${data.staticPaths.map((path) => `- ${path}`).join("\n")}

## Current catalog

- Published games: ${data.games.length}
- Tests: ${data.tests.length}
- Backlog candidates: ${data.backlog.length}
- Planned items: ${data.planning.length}
- Ranked games: ${tierTotal(data.gameTiers)}
- Ranked backlog entries: ${tierTotal(data.backlogTiers)}
- Ranked tests: ${tierTotal(data.testTiers)}

## Video and playlist pages

- Video pages: ${videoIds.length} total; showing up to ${MAX_MEDIA_PATHS_PER_TYPE}.
${videos.map((id) => `  - /video/${id}`).join("\n")}
- Playlist pages: ${playlistIds.length} total; showing up to ${MAX_MEDIA_PATHS_PER_TYPE}.
${playlists.map((id) => `  - /playlist/${id}`).join("\n")}

## Feeds

- JSON Feed: /feed.json
- RSS Feed: /rss.xml

### Recent entries

Showing up to ${MAX_RECENT_FEED_ENTRIES} entries.
${recentEntries.map(({title, url}) => `- ${title}${url ? `: ${url}` : ""}`).join("\n")}

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
        .filter((pathname) => !pathname.includes("["))
        .map((pathname) => getPathname({
            locale: routing.defaultLocale,
            href: pathname as Parameters<typeof getPathname>[0]["href"],
        }));
    const data: LlmContextData = {
        staticPaths,
        identifiers: await readJson(paths.identifiers),
        games: await readJson(paths.games),
        tests: await readJson(paths.tests),
        backlog: await readJson(paths.backlog),
        planning: await readJson(paths.planning),
        gameTiers: await readJson(paths.gameTiers),
        backlogTiers: await readJson(paths.backlogTiers),
        testTiers: await readJson(paths.testTiers),
        feed: await readJson(paths.feed),
    };

    await writeFile(outputPath, `${buildLlmContext(data)}\n`, "utf-8");
    console.log(`${outputPath} successfully written`);
}
