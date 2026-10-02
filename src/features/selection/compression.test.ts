import { compressSelection, decompressSelection } from './compression';

afterEach(() => vi.unstubAllGlobals());

const operations = [
    ['CompressionStream', compressSelection],
    ['DecompressionStream', decompressSelection],
] as const;

it.each(operations)('configures %s with deflate-raw', async (api, operation) => {
    const constructor = vi.fn(function () { return new TransformStream(); });
    vi.stubGlobal(api, constructor);
    expect(await operation(Uint8Array.from([1, 2]), 2)).toEqual(Uint8Array.from([1, 2]));
    expect(constructor).toHaveBeenCalledWith('deflate-raw');
});

it.each(operations)('reports missing %s', async (api, operation) => {
    vi.stubGlobal(api, undefined);
    await expect(operation(new Uint8Array(), 10)).rejects.toThrow('compressionUnavailable');
});

it.each(operations)('maps %s constructor failures', async (api, operation) => {
    vi.stubGlobal(api, vi.fn(function () { throw new TypeError('format'); }));
    await expect(operation(new Uint8Array(), 10)).rejects.toThrow('compressionUnavailable');
});

it.each(operations)('preserves %s processing failures', async (api, operation) => {
    vi.stubGlobal(api, vi.fn(function () {
        return new TransformStream({ transform() { throw new Error('stream failed'); } });
    }));
    await expect(operation(Uint8Array.from([1]), 10)).rejects.toThrow('stream failed');
});

it('round-trips a small payload with real streams', async () => {
    const bytes = new TextEncoder().encode('selection');
    const compressed = await compressSelection(bytes, 100);
    const decompressed = await decompressSelection(new Uint8Array(compressed), 100);
    expect(Array.from(decompressed)).toEqual(Array.from(bytes));
});
