import { fireEvent, render, screen } from '@testing-library/react';
import { createProviders, catalogue } from './testUtils';
import { SelectionCards } from './SelectionCards';
import type { SelectionEntry } from './catalogue';

const entries: SelectionEntry[] = Array.from({ length: 30 }, (_, index) => ({
    source: 'backlog', category: 'backlog', selectionId: String(index),
    game: { id: String(index), title: `Item ${index}`, imagePath: '/cover.webp' },
}));

function mount(list = entries) {
    const { wrapper, store } = createProviders([]);
    const onDetail = vi.fn();
    render(<SelectionCards entries={list} onDetail={onDetail} />, { wrapper });
    return { store, onDetail };
}

it('renders all supplied entries', () => {
    mount();
    expect(screen.getAllByRole('img', { name: /^Item / })).toHaveLength(entries.length);
});

it('renders an empty list', () => {
    mount([]);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
});

it('preserves published card links', () => {
    mount(catalogue);
    expect(screen.getByRole('link', { name: /Alpha/ })).toHaveAttribute('href', '/games/detail/game-0');
});

it('opens details for an entry', () => {
    const { onDetail } = mount();
    fireEvent.click(screen.getByRole('img', { name: 'Item 29' }).closest('button')!);
    expect(onDetail).toHaveBeenCalledWith(entries[29]);
});

it('toggles selection using raw IDs and explicit categories', () => {
    const { store, onDetail } = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Add Item 29 to my selection' }));
    expect(store.getState().selection.document.backlog).toEqual(['29']);
    const remove = screen.getByRole('button', { name: 'Remove Item 29 from my selection' });
    expect(remove).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(remove);
    expect(store.getState().selection.ids).toEqual([]);
    expect(onDetail).not.toHaveBeenCalled();
});

it('keeps published and backlog buttons independent when raw IDs collide', () => {
    const published: SelectionEntry = { ...catalogue[0], category: 'dlcs' };
    const backlog: SelectionEntry = { source: 'backlog', category: 'backlog', selectionId: published.game.id,
        game: { id: published.game.id, title: 'Waiting', imagePath: '/waiting.webp' } };
    const { store } = mount([published, backlog]);
    fireEvent.click(screen.getByRole('button', { name: 'Add Alpha to my selection' }));
    expect(store.getState().selection.document.dlcs).toEqual([published.game.id]);
    expect(screen.getByRole('button', { name: 'Add Waiting to my selection' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Add Waiting to my selection' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha from my selection' }));
    expect(store.getState().selection.document.backlog).toEqual([published.game.id]);
    expect(store.getState().selection.document.dlcs).toEqual([]);
});
