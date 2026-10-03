import { SELECTION_CATEGORIES, emptySelection } from './schema';
import { parseSharedSelection, selectionQuery } from './sharing';

it('round-trips all categorized identifiers with deflate-raw', async () => {
    const document = { games: ['game-a'], backlog: ['42'], dlcs: ['dlc-a'], planning: ['planned-a'] };
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
    params.set('entries', '!!!');
    expect(await parseSharedSelection(params)).toEqual({ kind: 'error', error: 'invalid' });
});
it.each(['', '!!!', 'a', 'YWJj'])('rejects malformed base64url or deflate-raw: %s', async encoded => {
    expect(await parseSharedSelection(new URLSearchParams({ entries: encoded }))).toEqual({ kind: 'error', error: 'invalid' });
});
it('reports missing browser compression APIs', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    await expect(selectionQuery(emptySelection())).rejects.toThrow('compressionUnavailable');
    vi.stubGlobal('DecompressionStream', undefined);
    expect(await parseSharedSelection(new URLSearchParams('entries=YWJj'))).toEqual({ kind: 'error', error: 'compressionUnavailable' });
    vi.unstubAllGlobals();
});

async function rawQuery(value: string) {
    const bytes = new TextEncoder().encode(value);
    const stream = new ReadableStream<BufferSource>({ start(controller) { controller.enqueue(bytes); controller.close(); } });
    const compressed = new Uint8Array(await new Response(stream.pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    const encoded = btoa(Array.from(compressed, byte => String.fromCharCode(byte)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URLSearchParams({ entries: encoded });
}
it('ignores incoming compressed schema versions', async () => {
    expect(await parseSharedSelection(await rawQuery(JSON.stringify({ ...emptySelection(), version: 3 })))).toEqual({ kind: 'selection', document: emptySelection() });
});

it.each(SELECTION_CATEGORIES)('round-trips arbitrary string IDs in shared %s', async category => {
    const ids = ['', 'bad.id!?', '日本語 🎮', 'a'.repeat(256), 'backlog:42', 'constructor', '__proto__'];
    const document = { ...emptySelection(), [category]: ids };
    expect(await parseSharedSelection(new URLSearchParams(await selectionQuery(document)))).toEqual({ kind: 'selection', document });
});

it('generates entries-only links and ignores old selection-only links', async () => {
    const params = new URLSearchParams(await selectionQuery(emptySelection()));
    expect([...params.keys()]).toEqual(['entries']);
    expect(await parseSharedSelection(new URLSearchParams('selection=YWJj&title=Alpha'))).toEqual({ kind: 'absent' });
});
it.each(['entries=', 'entries=YWJj&entries=YWJj', 'entries=&entries=YWJj'])('rejects empty or duplicate entries: %s', async query => {
    expect(await parseSharedSelection(new URLSearchParams(query))).toEqual({ kind: 'error', error: 'invalid' });
});
