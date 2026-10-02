import { classifySelection, normalizeSelectionIds, validateSelection, type SelectionCategories, type SelectionDocument } from './schema';

export const MAX_ENCODED_SIZE = 64 * 1024;
export const MAX_DECOMPRESSED_SIZE = 256 * 1024;
export type SharedSelection = { kind: 'absent' } | { kind: 'selection'; document: SelectionDocument } | { kind: 'error'; error: 'invalid' | 'unsupported' | 'compressionUnavailable' | 'tooLarge' };

async function readBounded(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > limit) { await reader.cancel(); throw new Error('tooLarge'); }
            chunks.push(value);
        }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes;
}
function bytesStream(bytes: Uint8Array<ArrayBuffer>): ReadableStream<BufferSource> {
    return new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } });
}
export async function selectionQuery(document: SelectionDocument): Promise<string> {
    if (typeof CompressionStream === 'undefined') throw new Error('compressionUnavailable');
    const bytes = new TextEncoder().encode(JSON.stringify(validateSelection(document)));
    if (bytes.length > MAX_DECOMPRESSED_SIZE) throw new Error('tooLarge');
    const compressed = await readBounded(bytesStream(bytes).pipeThrough(new CompressionStream('gzip')), MAX_ENCODED_SIZE * 3 / 4);
    const encoded = btoa(Array.from(compressed, byte => String.fromCharCode(byte)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URLSearchParams({ selection: encoded }).toString();
}
/** Compressed links take precedence over legacy links, including invalid ones. */
export async function parseSharedSelection(params: URLSearchParams, categories: SelectionCategories = {}): Promise<SharedSelection> {
    if (!params.has('selection')) {
        if (!params.has('games')) return { kind: 'absent' };
        const values = params.getAll('games');
        if (values.reduce((size, value) => size + value.length, 0) > MAX_ENCODED_SIZE) return { kind: 'error', error: 'tooLarge' };
        return { kind: 'selection', document: classifySelection(normalizeSelectionIds(values.flatMap(value => value.split(','))), categories) };
    }
    try {
        const values = params.getAll('selection');
        const encoded = values[0];
        if (encoded.length > MAX_ENCODED_SIZE) throw new Error('tooLarge');
        if (values.length !== 1 || !encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw new Error('invalid');
        if (typeof DecompressionStream === 'undefined') throw new Error('compressionUnavailable');
        const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const decoded = await readBounded(bytesStream(bytes).pipeThrough(new DecompressionStream('gzip')), MAX_DECOMPRESSED_SIZE);
        return { kind: 'selection', document: validateSelection(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decoded))) };
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return { kind: 'error', error: message === 'unsupported' || message === 'compressionUnavailable' || message === 'tooLarge' ? message : 'invalid' };
    }
}
