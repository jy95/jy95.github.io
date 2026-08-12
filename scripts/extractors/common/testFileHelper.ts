import { tmpdir } from 'os';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { unlinkSync, existsSync } from 'fs';

/**
 * Gives every extractor test its own throwaway output path under the OS
 * tmpdir (kept away from Vite/Vitest file watchers), plus a cleanup
 * function to remove it afterwards. Mirrors the isolation strategy already
 * used by `scripts/tasks/testDbHelper.ts` for database copies.
 */
export function tempOutputPath(name: string, extension = 'json'): { path: string; cleanup: () => void } {
    const path = resolve(tmpdir(), `yt-gaming-test-${name}-${randomUUID()}.${extension}`);
    return {
        path,
        cleanup: () => {
            if (existsSync(path)) {
                try {
                    unlinkSync(path);
                } catch {
                    // Ignore — matches the tolerant cleanup style of testDbHelper.ts
                }
            }
        },
    };
}