import { describe, it, expect } from 'vitest';
import { existsSync, writeFileSync } from 'fs';
import { tempOutputPath } from './testFileHelper';

describe('tempOutputPath', () => {
    it('returns a path under the OS tmpdir with the given name and default json extension', () => {
        const { path, cleanup } = tempOutputPath('my-test');
        expect(path).toContain('my-test');
        expect(path.endsWith('.json')).toBe(true);
        cleanup();
    });

    it('respects a custom extension', () => {
        const { path, cleanup } = tempOutputPath('my-test', 'xml');
        expect(path.endsWith('.xml')).toBe(true);
        cleanup();
    });

    it('produces a unique path on every call, even with the same name', () => {
        const a = tempOutputPath('same-name');
        const b = tempOutputPath('same-name');
        expect(a.path).not.toBe(b.path);
        a.cleanup();
        b.cleanup();
    });

    it('cleanup removes the file if it was created', () => {
        const { path, cleanup } = tempOutputPath('cleanup-test');
        writeFileSync(path, 'content');
        expect(existsSync(path)).toBe(true);

        cleanup();

        expect(existsSync(path)).toBe(false);
    });

    it('cleanup is a safe no-op when the file was never created', () => {
        const { path, cleanup } = tempOutputPath('never-created');
        expect(existsSync(path)).toBe(false);
        expect(() => cleanup()).not.toThrow();
    });
});