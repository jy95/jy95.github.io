import { act, cleanup, renderHook } from '@testing-library/react';
import { emptySelection } from '@/domain/selection/operations';
import { useIsSelected, usePersonalSelection, useSelectionWritable } from './hooks';
import { addSelection, clearSelection, getSelectionSnapshot, SELECTION_STORAGE_KEY, toggleSelection } from './store';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

it('shares one store between page and catalogue subscriptions with category separation', () => {
    const page = renderHook(usePersonalSelection);
    const catalogue = renderHook(() => ({
        selected: useIsSelected('missing', 'games'),
        backlog: useIsSelected('missing', 'backlog'),
        writable: useSelectionWritable(),
    }));
    expect(catalogue.result.current).toEqual({ selected: false, backlog: false, writable: true });
    act(() => { toggleSelection({ category: 'games', id: 'missing' }); });
    expect(page.result.current).toBe(getSelectionSnapshot());
    expect(page.result.current.document.games).toEqual(['missing']);
    expect(catalogue.result.current.selected).toBe(true);
    expect(catalogue.result.current.backlog).toBe(false);
    act(() => { clearSelection(); });
    expect(page.result.current.document).toEqual(emptySelection());
    expect(catalogue.result.current.selected).toBe(false);
});

it('reflects invalid storage, explicit recovery and write failures', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, 'broken');
    const { result } = renderHook(() => ({ personal: usePersonalSelection(), writable: useSelectionWritable() }));
    expect(result.current.personal.invalid).toBe(true);
    expect(result.current.writable).toBe(false);
    act(() => { clearSelection(); });
    expect(result.current.writable).toBe(true);
    act(() => { addSelection({ ...emptySelection(), games: ['saved'] }); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    act(() => { toggleSelection({ category: 'games', id: 'new' }); });
    expect(result.current.personal.document.games).toEqual(['saved']);
    expect(result.current.writable).toBe(false);
});

it('removes the storage listener only after the last hook unmounts', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const page = renderHook(usePersonalSelection);
    const catalogue = renderHook(() => useIsSelected('missing', 'games'));
    const storageCalls = () => remove.mock.calls.filter(([type]) => type === 'storage');
    expect(add.mock.calls.filter(([type]) => type === 'storage')).toHaveLength(1);
    page.unmount();
    expect(storageCalls()).toHaveLength(0);
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['missing'] }));
    act(() => { window.dispatchEvent(new StorageEvent('storage', { key: SELECTION_STORAGE_KEY, storageArea: localStorage })); });
    expect(catalogue.result.current).toBe(true);
    catalogue.unmount();
    expect(storageCalls()).toHaveLength(1);
});
