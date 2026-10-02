import { makeStore } from '@/redux/Store';
import { addSelection, clearSelection, hydrateSelection, selectSelectedIdSet, setSelectionCategories, toggleSelection } from './selectionSlice';
import { emptySelection } from './schema';

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

it('resolves previously unavailable legacy identifiers after catalogue updates', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection({ ...emptySelection(), legacyIds: ['missing'] }));
    store.dispatch(setSelectionCategories({ missing: 'dlcs' }));
    expect(store.getState().selection.document).toEqual({ ...emptySelection(), dlcs: ['missing'] });
});

it('preserves document, ids and selector references for invalid toggles', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection({ ...emptySelection(), games: ['game-a'] }));
    const before = store.getState().selection;
    const selected = selectSelectedIdSet(store.getState());
    for (const id of ['!!!', '', 'a'.repeat(129), `backlog:${'1'.repeat(129)}`]) {
        store.dispatch(toggleSelection(id));
        expect(store.getState().selection).toBe(before);
        expect(store.getState().selection.document).toBe(before.document);
        expect(store.getState().selection.ids).toBe(before.ids);
        expect(selectSelectedIdSet(store.getState())).toBe(selected);
    }
});

it('updates categories without replacing an unchanged document or ids', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection({ ...emptySelection(), games: ['game-a'] }));
    const before = store.getState().selection;
    const categories = { 'game-b': 'dlcs' } as const;
    store.dispatch(setSelectionCategories(categories));
    expect(store.getState().selection.categories).toBe(categories);
    expect(store.getState().selection.document).toBe(before.document);
    expect(store.getState().selection.ids).toBe(before.ids);
    store.dispatch(toggleSelection('game-b'));
    expect(store.getState().selection.document.dlcs).toEqual(['game-b']);
});
