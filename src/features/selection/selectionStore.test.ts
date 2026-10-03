import { addSelection, clearSelection, getSelectionSnapshot, subscribeSelection, toggleSelection } from './selectionPersistence';
import { SELECTION_STORAGE_KEY } from './storageFormat';
import { SELECTION_CATEGORIES, emptySelection } from './documentTypes';

beforeEach(() => localStorage.clear());
it.each(SELECTION_CATEGORIES)('toggles arbitrary strings in %s', category => {
    for (const id of ['', '日本語 🎮', '__proto__', 'constructor']) {
        expect(toggleSelection({ id, category })).toBe(true);
        expect(getSelectionSnapshot().document[category]).toEqual([id]);
        toggleSelection({ id, category });
        expect(getSelectionSnapshot().ids).toEqual([]);
    }
});
it('notifies same-tab consumers, merges categories, and persists clear', () => {
    const listener = vi.fn();
    const stop = subscribeSelection(listener);
    addSelection({ ...emptySelection(), games: ['a'], backlog: ['a', 'b', 'a'] });
    expect(getSelectionSnapshot().document.backlog).toEqual(['a', 'b']);
    expect(listener).toHaveBeenCalled();
    clearSelection();
    expect(getSelectionSnapshot().document).toEqual(emptySelection());
    stop();
});

it('keeps snapshots stable when stored document and storage status are unchanged', () => {
    const stop = subscribeSelection(() => {});
    const initial = getSelectionSnapshot();
    const listener = vi.fn();
    const stopListener = subscribeSelection(listener);
    clearSelection();
    expect(getSelectionSnapshot()).toBe(initial);
    expect(listener).not.toHaveBeenCalled();
    stopListener();
    stop();
});

it('reads the latest storage before every mutation without subscribers', () => {
    toggleSelection({ id: 'old', category: 'games' });
    const saved = { ...emptySelection(), games: ['external'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(saved));
    toggleSelection({ id: 'new', category: 'games' });
    expect(getSelectionSnapshot().document.games).toEqual(['external', 'new']);
});
