import {mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
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
    dlcs: [{dlcs: [{}, {}]}, {dlcs: [{}]}],
    series: [{}, {}],
    tests: [{}],
    backlog: [{}, {}, {}],
    planning: [{}, {}],
});

afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map((directory) =>
        rm(directory, {recursive: true, force: true}),
    ));
});

describe("LLM context extractor", () => {
    it("documents every public page with its purpose", () => {
        const output = buildLlmContext(data());

        for (const path of publicPaths) expect(output).toContain(`- ${path}:`);
        expect(output).toContain("Browse all published games and walkthroughs.");
        expect(output).toContain("Watch the YouTube video identified by id.");
        expect(output).toContain("Watch the YouTube walkthrough playlist identified by id.");
        expect(output).not.toContain("Video and playlist pages");
    });

    it("reports source-derived catalog totals without tier-list totals", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("Published games: 14");
        expect(output).toContain("Published DLCs: 3");
        expect(output).toContain("Series: 2");
        expect(output).toContain("Tests: 1");
        expect(output).toContain("Backlog candidates: 3");
        expect(output).toContain("Planned items: 2");
        expect(output).not.toContain("Ranked games");
        expect(output).not.toContain("Ranked backlog entries");
        expect(output).not.toContain("Ranked tests");
    });

    it("lists every game alphabetically with labeled YouTube identifiers", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("`playlistId` identifies a YouTube playlist for a walkthrough");
        expect(output).toContain("`videoId` identifies one YouTube video");
        expect(output.indexOf("- Alpha (`playlistId`: playlist-a)")).toBeLessThan(output.indexOf("- Zulu (`videoId`: video-z)"));
        for (let index = 0; index < 12; index++) expect(output).toContain(`playlist-${index}`);
        expect(output).toContain("walkthroughs");
        expect(output).not.toContain("playthroughs");
    });

    it("reflects game removal and includes feeds without recent entries", () => {
        const sourceData = data();
        const withGames = buildLlmContext(sourceData);
        const withoutAlpha = buildLlmContext({...sourceData, games: sourceData.games.filter(({title}) => title !== "Alpha")});

        expect(withGames).toContain("- Alpha");
        expect(withoutAlpha).not.toContain("- Alpha");
        expect(withoutAlpha).toContain("/feed.json");
        expect(withoutAlpha).toContain("/rss.xml");
        expect(withoutAlpha).not.toContain("Recent entries");
    });

    it("writes the generated context from the revised source contract", async () => {
        const directory = await mkdtemp(join(tmpdir(), "llms-extractor-"));
        temporaryDirectories.push(directory);
        const sourceData = data();
        const {staticPaths: _staticPaths, ...sources} = sourceData;
        const paths = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([name, value]) => {
            const path = join(directory, `${name}.json`);
            await writeFile(path, JSON.stringify(value), "utf-8");
            return [name, path];
        }))) as Record<keyof typeof sources, string>;
        const outputPath = join(directory, "llms.txt");

        await extractAndSaveLlmContext(outputPath, paths);

        const output = await readFile(outputPath, "utf-8");
        expect(output).toContain("Published DLCs: 3");
        for (const path of publicPaths) expect(output).toContain(`- ${path}:`);
    });
});
