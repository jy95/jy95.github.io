import { makeStore } from '@/redux/Store';
import { addSelection, clearSelection, hydrateSelection, selectSelectedIdsByCategory, toggleSelection } from './selectionSlice';
import { SELECTION_CATEGORIES, emptySelection } from './documentTypes';

it.each(SELECTION_CATEGORIES)('toggles arbitrary strings in %s', category => {
    const store = makeStore();
    store.dispatch(hydrateSelection(emptySelection()));
    for (const id of ['', '日本語 🎮', '__proto__', 'constructor']) {
        store.dispatch(toggleSelection({ id, category }));
        expect(store.getState().selection.document[category]).toEqual([id]);
        expect(selectSelectedIdsByCategory(store.getState())[category].has(id)).toBe(true);
        store.dispatch(toggleSelection({ id, category }));
        expect(store.getState().selection.ids).toEqual([]);
    }
});

it('keeps the same raw ID independent across categories, merges in order, and clears', () => {
    const store = makeStore();
    store.dispatch(hydrateSelection({ ...emptySelection(), games: ['a'] }));
    store.dispatch(toggleSelection({ id: 'a', category: 'backlog' }));
    store.dispatch(toggleSelection({ id: 'a', category: 'games' }));
    expect(store.getState().selection.document).toEqual({ ...emptySelection(), backlog: ['a'] });
    store.dispatch(addSelection({ ...emptySelection(), backlog: ['a', 'b', 'a'] }));
    expect(store.getState().selection.document.backlog).toEqual(['a', 'b']);
    store.dispatch(clearSelection());
    expect(store.getState().selection.document).toEqual(emptySelection());
});
