import { findIdsInTextArea } from './common/utils';

import { fileURLToPath } from 'url';
import { dirname, resolve, isAbsolute, sep, relative } from 'path';
import { access, cp } from 'fs/promises';

import type { Database } from 'better-sqlite3';
import type { CopyCoversPayload, Folder } from './common/types';

export type PairSummary = {
  sourceId: string;
  destId: string;
  success: boolean;
  note?: string;
};

export type CopyCoversResult = {
  totalPairs: number;
  successCount: number;
  errorCount: number;
  details: PairSummary[];
};

type ValidatedPairs = {
  sources: string[];
  destinations: string[];
  count: number;
};

const __dirname = dirname(fileURLToPath(import.meta.url));

const allowedFolders = new Set<Folder>([
  'covers',
  'testscovers',
  'backlogcovers',
]);

function resolveWithin(basePath: string, value: string): string {
  const candidate = resolve(basePath, value);
  const relativePath = relative(basePath, candidate);

  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new Error(`Path escapes the allowed directory: ${value}`);
  }

  return candidate;
}

/**
 * Checks if a path exists on the file system.
 */
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies a directory recursively using Node.js native fs.cp.
 */
async function copyDirectory(
  srcPath: string,
  destPath: string
): Promise<void> {
  await cp(srcPath, destPath, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });
}

/**
 * Extracts and validates source/destination IDs from the payload.
 */
function parseAndValidatePairs(payload: CopyCoversPayload): ValidatedPairs {
  const sources = findIdsInTextArea(payload.source_games_textarea);
  const destinations = findIdsInTextArea(payload.destination_games_textarea);

  if (sources.length === 0) {
    throw new Error('No source IDs provided in source_games_textarea');
  }
  if (destinations.length === 0) {
    throw new Error('No destination IDs provided in destination_games_textarea');
  }

  const count = Math.min(sources.length, destinations.length);
  if (sources.length !== destinations.length) {
    console.warn(
      `⚠️ sources (${sources.length}) and destinations (${destinations.length}) differ; processing ${count} pairs`
    );
  }

  return { sources, destinations, count };
}

/**
 * Processes the copying steps for a single source/destination pair.
 */
async function processPair(
  sourceId: string,
  destId: string,
  baseSrc: string,
  baseDest: string,
): Promise<PairSummary> {

    const summary: PairSummary = { sourceId, destId, success: false };
    const srcPath = resolveWithin(baseSrc, sourceId);
    const destPath = resolveWithin(baseDest, destId);

    // Check if source folder exists
    if (!(await pathExists(srcPath))) {
        summary.note = `Source folder not found on disk: ${srcPath}`;
        console.warn(`❌ ${summary.note}`);
        return summary;
    }

    // File copy operation
    try {
        await copyDirectory(srcPath, destPath);
        summary.success = true;
        console.log(`✅ Copied from ${srcPath} to ${destPath}`);
    } catch (error) {
        summary.note = `Error copying from ${srcPath} to ${destPath}: ${error}`;
        console.error(`❌ ${summary.note}`);
    }

    return summary;

}

/**
 * Resolves source and destination base directories on disk.
 */
function resolveBasePaths(sourceFolder: string, destinationFolder: string) {
  const basePublic = resolve(__dirname, '..', '..', 'public');
  return {
    baseSrc: resolveWithin(basePublic, sourceFolder),
    baseDest: resolveWithin(basePublic, destinationFolder),
  };
}

/**
 * Executes the copy process sequentially for all pairs.
 */
async function processAllPairs(
  pairs: ValidatedPairs,
  baseSrc: string,
  baseDest: string
): Promise<PairSummary[]> {
  const summaries: PairSummary[] = [];

  for (let i = 0; i < pairs.count; i++) {
    const summary = await processPair(
      pairs.sources[i],
      pairs.destinations[i],
      baseSrc,
      baseDest
    );
    summaries.push(summary);
  }

  return summaries;
}

/**
 * Builds the final result metrics from pair summaries.
 */
function buildResult(summaries: PairSummary[]): CopyCoversResult {
  const successCount = summaries.filter((s) => s.success).length;
  const totalPairs = summaries.length;

  return {
    totalPairs,
    successCount,
    errorCount: totalPairs - successCount,
    details: summaries,
  };
}

/**
 * Main orchestrator function to copy covers between folders.
 */
export async function copyCovers(_db: Database, payload: CopyCoversPayload) {
    const pairs = parseAndValidatePairs(payload);
    const { baseSrc, baseDest } = resolveBasePaths(
        payload.sourceFolder,
        payload.destinationFolder
    );

    const summaries = await processAllPairs(pairs, baseSrc, baseDest);
    const result = buildResult(summaries);

    console.log(
        `\nSummary: ${result.successCount}/${result.totalPairs} cover pairs processed successfully.`
    );

    return result;
}