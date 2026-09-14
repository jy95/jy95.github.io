import {mkdir, mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, describe, expect, it} from "vitest";

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
        {title: "Zulu", videoId: "video-z"},
        {title: "Alpha", playlistId: "playlist-a"},
        ...Array.from({length: 12}, (_, index) => ({title: `Game ${index}`, playlistId: `playlist-${index}`})),
    ],
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
        const source = await readFile(new URL("./llms.ts", import.meta.url), "utf-8");

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

    it("lists every game alphabetically with direct YouTube URLs", () => {
        const output = buildLlmContext(data());

        expect(output.indexOf("- Alpha (https://www.youtube.com/playlist?list=playlist-a)"))
            .toBeLessThan(output.indexOf("- Zulu (https://www.youtube.com/watch?v=video-z)"));
        for (let index = 0; index < 12; index++) {
            expect(output).toContain(`https://www.youtube.com/playlist?list=playlist-${index}`);
        }
        expect(output).not.toContain("playlistId");
        expect(output).not.toContain("videoId");
    });

    it("reflects additions and removals in games data", () => {
        const sourceData = data();
        const changedGames = [
            ...sourceData.games.filter(({title}) => title !== "Alpha"),
            {title: "Beta", videoId: "video-b"},
        ];
        const output = buildLlmContext({...sourceData, games: changedGames});

        expect(output).not.toContain("- Alpha (");
        expect(output).toContain("- Beta (https://www.youtube.com/watch?v=video-b)");
    });

    it("writes src/app/llms.txt/llms.txt from the revised source contract", async () => {
        const directory = await mkdtemp(join(tmpdir(), "llms-extractor-"));
        temporaryDirectories.push(directory);
        const sourceData = data();
        const paths = {} as {games: string; stats: string; backlog: string; planning: string};
        for (const name of ["games", "stats", "backlog", "planning"] as const) {
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
        expect(output).toContain("- Alpha (https://www.youtube.com/playlist?list=playlist-a)");
        for (const path of publicPaths) expect(output).toContain(`- ${path}:`);
    });
});
