import { resolve, relative, isAbsolute, sep } from 'node:path';

export function resolveWithin(basePath: string, value: string): string {
    if (!value || value.trim() === '') {
        throw new Error('Identifier value cannot be empty');
    }
    const candidate = resolve(basePath, value);
    const relativePath = relative(basePath, candidate);
    if (relativePath === '' || relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
        throw new Error(`Path escapes the allowed directory: ${value}`);
    }
    return candidate;
}