import { act, cleanup, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useIsSelected, usePersonalSelection, useSelectionWritable } from './selectionHooks';
import { getSelectionServerSnapshot, toggleSelection } from './selectionPersistence';
import { emptySelection } from './documentTypes';
import { SELECTION_STORAGE_KEY } from './storageFormat';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('hydrates saved storage and exposes writability without writing', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['saved'] }));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => ({ personal: usePersonalSelection(), selected: useIsSelected('saved', 'games'), writable: useSelectionWritable() }));
    expect(result.current.personal.hydrated).toBe(true);
    expect(result.current.selected).toBe(true);
    expect(result.current.writable).toBe(true);
    expect(write).not.toHaveBeenCalled();
});

it('renders stable server values even after the client store changes', () => {
    toggleSelection({ id: 'saved', category: 'games' });
    function Server() {
        const personal = usePersonalSelection();
        const selected = useIsSelected('saved', 'games');
        const writable = useSelectionWritable();
        return <span>{`${personal.hydrated},${selected},${writable}`}</span>;
    }
    expect(renderToString(<Server />)).toContain('false,false,false');
    expect(getSelectionServerSnapshot()).toBe(getSelectionServerSnapshot());
});

it('avoids unrelated item renders and updates when the item changes', () => {
    let renders = 0;
    const { result } = renderHook(() => { renders++; return useIsSelected('a', 'games'); });
    const before = renders;
    act(() => { toggleSelection({ id: 'b', category: 'games' }); });
    expect(renders).toBe(before);
    act(() => { toggleSelection({ id: 'a', category: 'dlcs' }); });
    expect(renders).toBe(before);
    act(() => { toggleSelection({ id: 'a', category: 'games' }); });
    expect(result.current).toBe(true);
    expect(renders).toBeGreaterThan(before);
});

it.each(['getItem', 'setItem'] as const)('reports %s failure and preserves saved items', method => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['saved'] }));
    const { result } = renderHook(() => ({ personal: usePersonalSelection(), writable: useSelectionWritable() }));
    vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new Error('denied'); });
    act(() => { expect(toggleSelection({ id: 'new', category: 'games' })).toBe(false); });
    expect(result.current.writable).toBe(false);
    expect(result.current.personal.document.games).toEqual(['saved']);
});

it('attaches one storage listener and removes it after the last subscriber', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const first = renderHook(() => usePersonalSelection());
    const second = renderHook(() => useSelectionWritable());
    expect(add.mock.calls.filter(([event]) => event === 'storage')).toHaveLength(1);
    first.unmount();
    expect(remove.mock.calls.filter(([event]) => event === 'storage')).toHaveLength(0);
    second.unmount();
    expect(remove.mock.calls.filter(([event]) => event === 'storage')).toHaveLength(1);
});
