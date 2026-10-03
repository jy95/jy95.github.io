import { afterEach, expect, it, vi } from 'vitest';
import { decodeSelection, encodeSelection } from './sharing';
import { SELECTION_CATEGORIES, emptySelection } from './selectionDocument';

afterEach(() => vi.unstubAllGlobals());

async function deflate(bytes: Uint8Array<ArrayBuffer>) {
    const source = new ReadableStream<BufferSource>({ start(c) { c.enqueue(bytes); c.close(); } })
        .pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(source).arrayBuffer());
}
const b64url = (bytes: Uint8Array) =>
    btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const payload = async (text: string) => b64url(await deflate(new TextEncoder().encode(text)));

it('round-trips every category, including unusual identifiers', async () => {
    const ids = ['', 'bad.id!?', '日本語 🎮', 'a'.repeat(300), '__proto__', 'x:y'];
    const document = { games: ['g'], backlog: ['42'], dlcs: ids, planning: ['p'] };
    expect(await decodeSelection(await encodeSelection(document))).toEqual(document);
    expect(await decodeSelection(await encodeSelection(emptySelection()))).toEqual(emptySelection());
});

it('produces URL-safe, unpadded output that is smaller than the JSON', async () => {
    const document = { ...emptySelection(), games: Array.from({ length: 200 }, (_, i) => `PLRfhDHeBTBJ${i}`) };
    const encoded = await encodeSelection(document);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(encoded.length).toBeLessThan(JSON.stringify(document).length);
});

it('ignores unknown fields and versions in incoming payloads', async () => {
    const decoded = await decodeSelection(await payload(JSON.stringify({ version: 3, games: ['a'], extra: 1 })));
    expect(decoded).toEqual({ ...emptySelection(), games: ['a'] });
});

it.each(['', '!!!', 'a', 'YWJj'])('rejects malformed base64url or non-deflate bytes: %j', async value => {
    expect(await decodeSelection(value)).toBeNull();
});

it('rejects truncated deflate data, non-JSON text and invalid UTF-8', async () => {
    const big = await deflate(new TextEncoder().encode(JSON.stringify({ games: Array.from({ length: 500 }, (_, i) => `id-${i}`) })));
    expect(await decodeSelection(b64url(big.slice(0, Math.floor(big.length / 2))))).toBeNull();
    expect(await decodeSelection(await payload('not json'))).toBeNull();
    expect(await decodeSelection(b64url(await deflate(Uint8Array.from([0xff, 0xfe]))))).toBeNull();
});

it('falls back to an empty document for valid JSON of the wrong shape', async () => {
    expect(await decodeSelection(await payload('42'))).toEqual(emptySelection());
});

it('reports missing compression support', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    await expect(encodeSelection(emptySelection())).rejects.toThrow();
    vi.stubGlobal('DecompressionStream', undefined);
    expect(await decodeSelection('YWJj')).toBeNull();
    expect(SELECTION_CATEGORIES.length).toBeGreaterThan(0);
});