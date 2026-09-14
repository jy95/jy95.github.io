import {readFile, writeFile} from "node:fs/promises";

import {buildLlmContext} from "./llms/document";
import {buildStaticPaths} from "./llms/site-pages";
import type {LlmContextSourcePaths} from "./llms/types";

export {buildLlmContext} from "./llms/document";
export type {LlmContextData, LlmContextSourcePaths} from "./llms/types";

const readJson = async <T>(path: string): Promise<T> =>
    JSON.parse(await readFile(path, "utf-8")) as T;

export async function extractAndSaveLlmContext(
    outputPath: string,
    paths: LlmContextSourcePaths,
): Promise<void> {
    const [games, stats, backlog, planning] = await Promise.all([
        readJson(paths.games), readJson(paths.stats), readJson(paths.backlog), readJson(paths.planning),
    ]);

    await writeFile(outputPath, `${buildLlmContext({
        staticPaths: buildStaticPaths(), games, stats, backlog, planning,
    })}\n`, "utf-8");
    console.log(`${outputPath} successfully written`);
}
