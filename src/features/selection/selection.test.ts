import { makeStore } from '@/redux/Store';
import { addSelection, clearSelection, hydrateSelection, setSelectionCategories, parseStoredSelection, SELECTION_STORAGE_KEY, toggleSelection } from './selectionSlice';
import { connectSelectionStorage } from './selectionPersistence';
import { classifySelection, emptySelection, validateSelection } from './schema';
import { parseSharedSelection, selectionQuery } from './sharing';
import { loadSelectionCatalogue } from './catalogue';
import * as gamesData from '@/lib/gamesData';

beforeEach(() => { localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); });

it('toggles, merges without duplicates, and clears game identifiers', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection([]));
    store.dispatch(toggleSelection('game-a'));
    store.dispatch(addSelection(['game-a', 'game-b', 'backlog:42']));
    expect(store.getState().selection.ids).toEqual(['backlog:42', 'game-a', 'game-b']);
    store.dispatch(toggleSelection('game-a'));
    expect(store.getState().selection.ids).toEqual(['backlog:42', 'game-b']);
    store.dispatch(clearSelection());
    expect(store.getState().selection.ids).toEqual([]);
});

it('restores browser storage before subscribing and persists changes across new stores', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["game-a"]');
    const store = makeStore();
    expect(store.getState().selection.hydrated).toBe(false);
    const stop = connectSelectionStorage(store);
    expect(store.getState().selection.ids).toEqual(['game-a']);
    store.dispatch(toggleSelection('game-b'));
    stop();
    const reloaded = makeStore();
    const stopReloaded = connectSelectionStorage(reloaded);
    expect(reloaded.getState().selection.ids).toEqual(['game-a', 'game-b']);
    reloaded.dispatch(clearSelection());
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBe(JSON.stringify(emptySelection()));
    stopReloaded();
});

it('syncs another tab and storage clearing without echoing writes', () => {
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: SELECTION_STORAGE_KEY, newValue: '["game-b"]' }));
    expect(store.getState().selection.ids).toEqual(['game-b']);
    expect(write).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: null }));
    expect(store.getState().selection.ids).toEqual([]);
    stop();
});

it('keeps the feature usable when browser storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    store.dispatch(toggleSelection('game-a'));
    expect(store.getState().selection).toMatchObject({ ids: ['game-a'], hydrated: true, storageAvailable: false });
    stop();
});

it.each(['broken', 'null', '{}', '42'])('handles corrupt storage: %s', value => {
    expect(parseStoredSelection(value)).toEqual([]);
});

it('round-trips all categorized identifiers with gzip', async () => {
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
it('classifies legacy identifiers from catalogue information and retains unknown IDs', () => {
    expect(classifySelection(['game-a', 'dlc-a', 'planned-a', 'backlog:42', 'missing'], { 'game-a': 'games', 'dlc-a': 'dlcs', 'planned-a': 'planning' })).toEqual({ version: 2, games: ['game-a'], backlog: ['42'], dlcs: ['dlc-a'], planning: ['planned-a'], legacyIds: ['missing'] });
});
it('validates categories, versions and identifiers and deduplicates', () => {
    expect(validateSelection({ ...emptySelection(), dlcs: ['dlc-a', 'dlc-a'] }).dlcs).toEqual(['dlc-a']);
    expect(() => validateSelection({ ...emptySelection(), version: 3 })).toThrow('unsupported');
    expect(() => validateSelection({ ...emptySelection(), backlog: ['backlog:42'] })).toThrow('invalid');
    expect(() => validateSelection({ version: 2 })).toThrow('invalid');
});
it.each(['', '!!!', 'a', 'YWJj'])('rejects malformed base64url or gzip: %s', async encoded => {
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

it('resolves every existing game card from series and game tiers', async () => {
    const catalogue = await loadSelectionCatalogue();
    const ids = new Set(catalogue.map(entry => entry.selectionId));
    expect(ids.size).toBe(catalogue.length);
    const series = (await import('@/app/api/series/series.json')).default;
    const tiers = (await import('@/app/api/tier-lists/games/games.json')).default;
    const cards = [...series.flatMap(group => group.items).map(game => 'playlistId' in game ? game.playlistId : game.videoId), ...Object.values(tiers).flat().map(game => game.id)];
    expect(cards.filter(id => !id || !ids.has(id))).toEqual([]);
    expect(catalogue.some(entry => entry.source === 'backlog')).toBe(true);
    expect(catalogue.some(entry => entry.source === 'planning')).toBe(true);
});

it('migrates storage categories immediately and preserves unresolved selections', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["dlc-a","planned-a","backlog:42","missing"]');
    const store = makeStore();
    store.dispatch(setSelectionCategories({ 'dlc-a': 'dlcs', 'planned-a': 'planning' }));
    const stop = connectSelectionStorage(store);
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual({ version: 2, games: [], backlog: ['42'], dlcs: ['dlc-a'], planning: ['planned-a'], legacyIds: ['missing'] });
    stop();
});
async function rawQuery(value: string) {
    const bytes = new TextEncoder().encode(value);
    const stream = new ReadableStream<BufferSource>({ start(controller) { controller.enqueue(bytes); controller.close(); } });
    const compressed = new Uint8Array(await new Response(stream.pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    const encoded = btoa(Array.from(compressed, byte => String.fromCharCode(byte)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URLSearchParams({ selection: encoded });
}
it('rejects unsupported compressed schema versions', async () => {
    expect(await parseSharedSelection(await rawQuery(JSON.stringify({ ...emptySelection(), version: 3 })))).toEqual({ kind: 'error', error: 'unsupported' });
});
it('limits gzip expansion before parsing JSON', async () => {
    expect(await parseSharedSelection(await rawQuery(' '.repeat(256 * 1024 + 1)))).toEqual({ kind: 'error', error: 'tooLarge' });
});
it('synchronizes categorized storage without echo writes', () => {
    const store = makeStore();
    const stop = connectSelectionStorage(store);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const document = { ...emptySelection(), dlcs: ['dlc-a'], backlog: ['42'] };
    window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: SELECTION_STORAGE_KEY, newValue: JSON.stringify(document) }));
    expect(store.getState().selection.document).toEqual(document);
    expect(write).not.toHaveBeenCalled();
    stop();
});

it('retains identifiers that match object prototype property names', () => {
    expect(classifySelection(['constructor', 'toString', '__proto__']).legacyIds).toEqual(['constructor', 'toString', '__proto__']);
});
it('resolves previously unavailable legacy identifiers after catalogue updates', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection({ ...emptySelection(), legacyIds: ['missing'] }));
    store.dispatch(setSelectionCategories({ missing: 'dlcs' }));
    expect(store.getState().selection.document).toEqual({ ...emptySelection(), dlcs: ['missing'] });
});
it('preserves migrated selections when writing storage fails', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["dlc-a"]');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const store = makeStore();
    store.dispatch(setSelectionCategories({ 'dlc-a': 'dlcs' }));
    const stop = connectSelectionStorage(store);
    expect(store.getState().selection.document.dlcs).toEqual(['dlc-a']);
    expect(store.getState().selection.storageAvailable).toBe(false);
    stop();
});

it('classifies overlapping catalogue sources deterministically while retaining rendering sources', async () => {
    const published = { videoId: 'shared', title: 'Published', platform: 1, genres: [] };
    vi.spyOn(gamesData, 'loadPublishedGames').mockResolvedValue([published]);
    vi.spyOn(gamesData, 'loadDlcGroups').mockResolvedValue([{ id: 'group', game_title: 'Group', dlcs: [{ ...published, id: 1 }, { videoId: 'dlc-only', title: 'DLC', platform: 1, id: 2 }] }]);
    vi.spyOn(gamesData, 'loadPlanningGames').mockResolvedValue([published, { videoId: 'dlc-only', title: 'Planned DLC', platform: 1 }, { videoId: 'planned-only', title: 'Planning', platform: 1 }]);
    vi.spyOn(gamesData, 'loadBacklogGames').mockResolvedValue([]);
    const catalogue = await loadSelectionCatalogue();
    expect(catalogue.map(({ selectionId, category, source }) => ({ selectionId, category, source }))).toEqual([
        { selectionId: 'shared', category: 'games', source: 'published' },
        { selectionId: 'dlc-only', category: 'dlcs', source: 'published' },
        { selectionId: 'planned-only', category: 'planning', source: 'planning' },
    ]);
});
