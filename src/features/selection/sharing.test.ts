import { emptySelection } from './schema';
import { parseSharedSelection, selectionQuery } from './sharing';

it('round-trips all categorized identifiers with deflate-raw', async () => {
    const document = { version: 2 as const, games: ['game-a'], backlog: ['42'], dlcs: ['dlc-a'], planning: ['planned-a'] };
    expect(await parseSharedSelection(new URLSearchParams(await selectionQuery(document)))).toEqual({ kind: 'selection', document });
    expect(await parseSharedSelection(new URLSearchParams(await selectionQuery(emptySelection())))).toEqual({ kind: 'selection', document: emptySelection() });
    expect(await parseSharedSelection(new URLSearchParams())).toEqual({ kind: 'absent' });
});
it.each(['games=', 'games=game-a,backlog:42', 'games=!!!', 'games=game-a&games=game-b'])('ignores games-only queries: %s', async query => {
    expect(await parseSharedSelection(new URLSearchParams(query))).toEqual({ kind: 'absent' });
});
it('uses only the compressed selection when games is also present', async () => {
    const document = { ...emptySelection(), games: ['game-a'] };
    const params = new URLSearchParams(await selectionQuery(document));
    params.set('games', 'game-b');
    expect(await parseSharedSelection(params)).toEqual({ kind: 'selection', document });
    params.set('selection', '!!!');
    expect(await parseSharedSelection(params)).toEqual({ kind: 'error', error: 'invalid' });
});
it.each(['', '!!!', 'a', 'YWJj'])('rejects malformed base64url or deflate-raw: %s', async encoded => {
    expect(await parseSharedSelection(new URLSearchParams({ selection: encoded }))).toEqual({ kind: 'error', error: 'invalid' });
});
it('bounds encoded input', async () => {
    expect(await parseSharedSelection(new URLSearchParams({ selection: 'a'.repeat(65537) }))).toEqual({ kind: 'error', error: 'tooLarge' });
});
it('reports missing browser compression APIs', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    await expect(selectionQuery(emptySelection())).rejects.toThrow('compressionUnavailable');
    vi.stubGlobal('DecompressionStream', undefined);
    expect(await parseSharedSelection(new URLSearchParams('selection=YWJj'))).toEqual({ kind: 'error', error: 'compressionUnavailable' });
    vi.unstubAllGlobals();
});

async function rawQuery(value: string) {
    const bytes = new TextEncoder().encode(value);
    const stream = new ReadableStream<BufferSource>({ start(controller) { controller.enqueue(bytes); controller.close(); } });
    const compressed = new Uint8Array(await new Response(stream.pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    const encoded = btoa(Array.from(compressed, byte => String.fromCharCode(byte)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URLSearchParams({ selection: encoded });
}
it('rejects unsupported compressed schema versions', async () => {
    expect(await parseSharedSelection(await rawQuery(JSON.stringify({ ...emptySelection(), version: 3 })))).toEqual({ kind: 'error', error: 'unsupported' });
});
it('limits deflate-raw expansion before parsing JSON', async () => {
    expect(await parseSharedSelection(await rawQuery(' '.repeat(256 * 1024 + 1)))).toEqual({ kind: 'error', error: 'tooLarge' });
});
