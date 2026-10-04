import { encodeSelection, decodeSelection } from './sharing';
import { compress, toBase64Url } from './encoding';
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
