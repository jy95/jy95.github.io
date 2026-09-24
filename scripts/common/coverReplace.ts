import { mkdir, rm, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * Writes the desired content into a temporary staging directory (sibling to `finalDir`),
 * then atomically swaps it into place of `finalDir`.
 *
 * The existing cover directory is never removed before the replacement content is fully
 * written and ready to be swapped in. Used by `add-cover.ts` and reusable for any workflow
 * requiring atomic replacement of a cover folder for a given ID.
 *
 * @param finalDir - The destination directory path where the cover should ultimately reside.
 * @param writeInto - An async callback function that receives the temporary `stagingDir` path
 *                    and performs all necessary file-writing operations inside it.
 * @returns A promise that resolves when the atomic swap is complete.
 * @throws {Error} Throws an error if file creation, writing, or the atomic rename operation fails.
 *                 If an error occurs during the swap step, the staging directory is preserved for inspection.
 */
export async function replaceCoverAtomically(
    finalDir: string,
    writeInto: (stagingDir: string) => Promise<void>
): Promise<void> {
    const parentDir = resolve(finalDir, '..');
    const stagingDir = resolve(parentDir, `.staging-${randomBytes(8).toString('hex')}`);

    let shouldCleanupStaging = true;
    try {
        await mkdir(stagingDir, { recursive: true });
        await writeInto(stagingDir);

        try {
            await rm(finalDir, { recursive: true, force: true });
            await rename(stagingDir, finalDir);
        } catch (swapError) {
            shouldCleanupStaging = false;
            throw new Error(
                `Failed to complete cover replacement (staging preserved at: ${stagingDir}): ${swapError}`
            );
        }
    } catch (error) {
        if (shouldCleanupStaging) {
            await rm(stagingDir, { recursive: true, force: true }).catch(() => {});
        }
        throw error;
    }
}