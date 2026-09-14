import {mkdtemp, readFile, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach, describe, expect, it} from "vitest";

import {
    buildLlmContext,
    extractAndSaveLlmContext,
    MAX_MEDIA_PATHS_PER_TYPE,
    MAX_RECENT_FEED_ENTRIES,
    type LlmContextData,
} from "./llms";

const temporaryDirectories: string[] = [];

const data = (): LlmContextData => ({
    staticPaths: ["/", "/games", "/new-page"],
    identifiers: Array.from({length: MAX_MEDIA_PATHS_PER_TYPE + 1}, (_, index) => ({
        videoId: `video-${index}`,
        playlistId: `playlist-${index}`,
    })),
    games: [{}, {}],
    tests: [{}],
    backlog: [{}, {}, {}],
    planning: [{}, {}],
    gameTiers: {recommended: [{}, {}]},
    backlogTiers: {later: [{}]},
    testTiers: {},
    feed: {
        items: Array.from({length: MAX_RECENT_FEED_ENTRIES + 1}, (_, index) => ({
            title: `Entry ${index}`,
            url: `https://example.com/${index}`,
        })),
    },
});

afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map((directory) =>
        rm(directory, {recursive: true, force: true}),
    ));
});

describe("LLM context extractor", () => {
    it("includes configured paths, catalog totals, feeds, and bounded source entries", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("- /new-page");
        expect(output).toContain("Published games: 2");
        expect(output).toContain("Backlog candidates: 3");
        expect(output).toContain("Ranked games: 2");
        expect(output).toContain("/feed.json");
        expect(output).toContain("/rss.xml");
        expect(output).toContain("Entry 0: https://example.com/0");
        expect(output).not.toContain(`Entry ${MAX_RECENT_FEED_ENTRIES}`);
    });

    it("limits video and playlist paths and omits removed source material", () => {
        const output = buildLlmContext(data());

        expect(output).toContain("/video/video-0");
        expect(output).toContain("/playlist/playlist-0");
        expect(output).not.toContain(`/video/video-${MAX_MEDIA_PATHS_PER_TYPE}`);
        expect(output).not.toContain(`/playlist/playlist-${MAX_MEDIA_PATHS_PER_TYPE}`);
        expect(output).not.toContain("/removed-page");
        expect(output).not.toContain("database schema");
        expect(output).not.toContain("package.json");
    });

    it("writes the generated context file from supplied source files", async () => {
        const directory = await mkdtemp(join(tmpdir(), "llms-extractor-"));
        temporaryDirectories.push(directory);
        const sourceData = data();
        const sources = {
            identifiers: sourceData.identifiers,
            games: sourceData.games,
            tests: sourceData.tests,
            backlog: sourceData.backlog,
            planning: sourceData.planning,
            gameTiers: sourceData.gameTiers,
            backlogTiers: sourceData.backlogTiers,
            testTiers: sourceData.testTiers,
            feed: sourceData.feed,
        };
        const paths = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([name, value]) => {
            const path = join(directory, `${name}.json`);
            await writeFile(path, JSON.stringify(value), "utf-8");
            return [name, path];
        }))) as Record<keyof typeof sources, string>;
        const outputPath = join(directory, "llms.txt");

        await extractAndSaveLlmContext(outputPath, paths);

        const output = await readFile(outputPath, "utf-8");
        expect(output).toContain("# GamesPassionFR");
        expect(output).toContain("Published games: 2");
        expect(output).toContain("/games");
    });
});
