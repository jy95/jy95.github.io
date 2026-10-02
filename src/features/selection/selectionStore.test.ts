import { makeStore } from '@/redux/Store';
import { addSelection, clearSelection, hydrateSelection, setSelectionCategories, toggleSelection } from './selectionSlice';
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
