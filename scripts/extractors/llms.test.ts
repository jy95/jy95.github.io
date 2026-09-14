import {mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.mock("next-intl/navigation", () => import("../../src/test/mocks/nextIntlNavigation"));

import {buildLlmContext, extractAndSaveLlmContext, type LlmContextData} from "./llms";

const temporaryDirectories: string[] = [];
const publicPaths = [
    "/", "/games", "/games/series", "/games/dlcs", "/games/random", "/planning", "/backlog",
    "/tests", "/stats", "/tier", "/tier/games", "/tier/backlog", "/tier/tests", "/links",
    "/video/:id", "/playlist/:id",
];

const data = (): LlmContextData => ({
    staticPaths: publicPaths,
    games: [
        {title: "Zulu", videoId: "video-z", platform: 1},
        {title: "Alpha", playlistId: "playlist-a", platform: 1},
        {title: "Duplicate", videoId: "duplicate-video", platform: 2},
        {title: "Duplicate", playlistId: "duplicate-playlist", platform: 1},
        ...Array.from({length: 10}, (_, index) => ({title: `Game ${index}`, playlistId: `playlist-${index}`, platform: 1})),
    ],
    platforms: [{id: 1, name: "PC"}, {id: 2, name: "PSP"}],
    stats: {general: {
        games: {total: 19, total_available: 14},
        duration: {
            total: {hours: 120, minutes: 30, seconds: 10},
            total_available: {hours: 100, minutes: 20, seconds: 5},
        },
    }},
    backlog: [{}, {}, {}],
    planning: [{}, {}],
});

afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map((directory) =>
        rm(directory, {recursive: true, force: true}),
    ));
});

describe("LLM context extractor", () => {
    it("keeps the entry point small and delegates document rendering", async () => {
        const source = await readFile(resolve("scripts/extractors/llms.ts"), "utf-8");

        expect(source.split("\n").length).toBeLessThan(35);
        expect(source).toContain('import {buildLlmContext} from "./llms/document"');
        expect(source).toContain("buildLlmContext({");
    });

    it("documents every public page and orders the sections", () => {
        const output = buildLlmContext(data());

        for (const path of publicPaths) expect(output).toContain(`- ${path}:`);
        const headings = ["## Site pages", "## Feeds", "## Guidance for assistants", "## Current catalog", "## Published games"];
        for (let index = 1; index < headings.length; index++) {
            expect(output.indexOf(headings[index - 1])).toBeLessThan(output.indexOf(headings[index]));
        }
    });

    it("lists the sitemap and feed endpoints", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("- Sitemap: /sitemap.xml");
        expect(output).toContain("- JSON Feed: /feed.json");
        expect(output).toContain("- RSS Feed: /rss.xml");
    });

    it("uses general statistics and omits DLC, series, and test counts", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("Published games: 14");
        expect(output).toContain("Available walkthrough duration: 100 hours 20 minutes 5 seconds");
        expect(output).toContain("Total catalog duration: 120 hours 30 minutes 10 seconds");
        expect(output).toContain("Backlog candidates: 3");
        expect(output).toContain("Planned items: 2");
        expect(output).not.toMatch(/Published DLCs:|Series:|Tests:/);
    });

    it("handles missing statistics safely", () => {
        const output = buildLlmContext({...data(), stats: {}});

        expect(output).toContain("Published games: 0");
        expect(output).toContain("Available walkthrough duration: 0 hours 0 minutes 0 seconds");
    });

    it("lists every game alphabetically with direct YouTube Markdown links", () => {
        const output = buildLlmContext(data());

        const alpha = "- [Alpha](https://www.youtube.com/playlist?list=playlist-a)";
        const zulu = "- [Zulu](https://www.youtube.com/watch?v=video-z)";
        expect(output).toContain(alpha);
        expect(output).toContain(zulu);
        expect(output.indexOf(alpha)).toBeLessThan(output.indexOf(zulu));
        expect(output).not.toMatch(/^- [^\n[]+ \(https:\/\/www\.youtube\.com\//m);
        for (let index = 0; index < 10; index++) {
            expect(output).toContain(`https://www.youtube.com/playlist?list=playlist-${index}`);
        }
        expect(output).not.toContain("playlistId");
        expect(output).not.toContain("videoId");
    });

    it("adds platform names only when duplicate titles need disambiguation", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("- [Duplicate (PSP)](https://www.youtube.com/watch?v=duplicate-video)");
        expect(output).toContain("- [Duplicate (PC)](https://www.youtube.com/playlist?list=duplicate-playlist)");
        expect(output).toContain("- [Alpha](https://www.youtube.com/playlist?list=playlist-a)");
        expect(output).not.toContain("[Alpha (PC)]");
    });

    it("handles a missing platform mapping safely", () => {
        const sourceData = data();
        const games = sourceData.games.map((game) => game.title === "Duplicate" && game.platform === 2
            ? {...game, platform: 999}
            : game);

        expect(buildLlmContext({...sourceData, games})).toContain(
            "- [Duplicate](https://www.youtube.com/watch?v=duplicate-video)",
        );
    });

    it("reflects additions and removals in games data", () => {
        const sourceData = data();
        const changedGames = [
            ...sourceData.games.filter(({title}) => title !== "Alpha"),
            {title: "Beta", videoId: "video-b", platform: 1},
        ];
        const output = buildLlmContext({...sourceData, games: changedGames});

        expect(output).not.toContain("- [Alpha](");
        expect(output).toContain("- [Beta](https://www.youtube.com/watch?v=video-b)");
    });

    it("writes src/app/llms.txt/llms.txt from the revised source contract", async () => {
        const directory = await mkdtemp(join(tmpdir(), "llms-extractor-"));
        temporaryDirectories.push(directory);
        const sourceData = data();
        const paths = {} as {games: string; platforms: string; stats: string; backlog: string; planning: string};
        for (const name of ["games", "platforms", "stats", "backlog", "planning"] as const) {
            paths[name] = join(directory, `${name}.json`);
            await writeFile(paths[name], JSON.stringify(sourceData[name]), "utf-8");
        }
        const outputPath = join(directory, "src/app/llms.txt/llms.txt");
        await mkdir(join(directory, "src/app/llms.txt"), {recursive: true});

        await extractAndSaveLlmContext(outputPath, paths);

        const output = await readFile(outputPath, "utf-8");
        expect(output).toContain("Published games: 14");
        expect(output).toContain("Backlog candidates: 3");
        expect(output).toContain("Planned items: 2");
        expect(output).toContain("- [Alpha](https://www.youtube.com/playlist?list=playlist-a)");
        for (const path of publicPaths) expect(output).toContain(`- ${path}:`);
    });
});
