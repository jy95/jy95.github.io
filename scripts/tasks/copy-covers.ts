import { findIdsInTextArea, validateFolder } from './common/utils';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { access, cp } from 'node:fs/promises';
import { resolveWithin } from './common/pathSafety';

import type { Database } from 'better-sqlite3';
import type { CopyCoversPayload } from './common/types';

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

    try {
        await cp(srcPath, destPath, {
            recursive: true,
            force: true,
            errorOnExist: false,
        });
        summary.success = true;
        console.log(`✅ Copied from ${srcPath} to ${destPath}`);
    } catch (error) {
        summary.note = `Error copying from ${srcPath} to ${destPath}: ${error}`;
        console.error(`❌ ${summary.note}`);
    }

    return summary;

}

/**
 * Main orchestrator function to copy covers between folders.
 */
export async function copyCovers(_db: Database, payload: CopyCoversPayload) {
    validateFolder(payload.sourceFolder);
    validateFolder(payload.destinationFolder);

    const pairs = parseAndValidatePairs(payload);
    const basePublic = resolve(__dirname, '..', '..', 'public');
    const baseSrc = resolveWithin(basePublic, payload.sourceFolder);
    const baseDest = resolveWithin(basePublic, payload.destinationFolder);
    const summaries: PairSummary[] = [];

    for (let i = 0; i < pairs.count; i++) {
        summaries.push(await processPair(
            pairs.sources[i],
            pairs.destinations[i],
            baseSrc,
            baseDest
        ));
    }

    const successCount = summaries.filter((summary) => summary.success).length;
    const result: CopyCoversResult = {
        totalPairs: summaries.length,
        successCount,
        errorCount: summaries.length - successCount,
        details: summaries,
    };

    console.log(
        `\nSummary: ${result.successCount}/${result.totalPairs} cover pairs processed successfully.`
    );

    return result;
}
