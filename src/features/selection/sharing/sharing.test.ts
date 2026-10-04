import { encodeSelection, decodeSelection } from './sharing';
import { toBase64Url } from './encoding';
import { compress } from './compression';
import { emptySelection } from '@/domain/selection/operations';

afterEach(() => vi.restoreAllMocks());
it('round trips all categories and missing identifiers without storage writes', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const document = { games: ['missing'], backlog: ['same'], planning: ['same'], dlcs: ['ghost'] };
    expect(await decodeSelection(await encodeSelection(document))).toEqual(document);
    expect(write).not.toHaveBeenCalled();
});
it.each(['!!!', '', 'A', 'a=', 'ab', 'not_compressed'])('rejects malformed Base64 or compression: %s', async param => {
    expect(await decodeSelection(param)).toBeNull();
});
it.each(['null', '{}', '[]', '{', JSON.stringify({ ...emptySelection(), games: [42] }), JSON.stringify({ ...emptySelection(), extra: [] })])('rejects JSON or document shape %s', async text => {
    const param = toBase64Url(await compress(new TextEncoder().encode(text)));
    expect(await decodeSelection(param)).toBeNull();
});
it('rejects malformed UTF-8', async () => {
    expect(await decodeSelection(toBase64Url(await compress(new Uint8Array([0xc3, 0x28]))))).toBeNull();
});
it('reports unavailable compression support', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    try { await expect(encodeSelection(emptySelection())).rejects.toThrow(); }
    finally { vi.unstubAllGlobals(); }
});

it('rejects invalid documents before compressing', async () => {
    const compression = vi.fn();
    vi.stubGlobal('CompressionStream', compression);
    try {
        const invalid = { ...emptySelection(), extra: [] };
        await expect(encodeSelection(invalid)).rejects.toThrow('invalid');
        expect(compression).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
});

it('rejects truncated compressed documents', async () => {
    const bytes = await compress(new TextEncoder().encode(JSON.stringify(emptySelection())));
    expect(await decodeSelection(toBase64Url(bytes.slice(0, -1)))).toBeNull();
});

it.each(['CompressionStream', 'DecompressionStream'] as const)('propagates %s failures even after partial output', async name => {
    const encoded = await encodeSelection(emptySelection());
    vi.stubGlobal(name, class {
        readable: ReadableStream<Uint8Array>;
        writable: WritableStream<Uint8Array>;
        constructor() {
            const stream = new TransformStream<Uint8Array, Uint8Array>({
                transform(_chunk, controller) {
                    controller.enqueue(new TextEncoder().encode(JSON.stringify(emptySelection())));
                },
                flush() { throw new Error('stream failed'); },
            });
            this.readable = stream.readable;
            this.writable = stream.writable;
        }
    });
    try {
        if (name === 'CompressionStream') {
            await expect(encodeSelection(emptySelection())).rejects.toThrow('stream failed');
        } else {
            expect(await decodeSelection(encoded)).toBeNull();
        }
    } finally { vi.unstubAllGlobals(); }
});

it('fails cleanly when decompression support is unavailable', async () => {
    const encoded = await encodeSelection(emptySelection());
    vi.stubGlobal('DecompressionStream', undefined);
    try { expect(await decodeSelection(encoded)).toBeNull(); }
    finally { vi.unstubAllGlobals(); }
});
