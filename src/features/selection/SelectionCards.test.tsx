import { act, fireEvent, render, screen } from '@testing-library/react';
import { setup, catalogue } from './testUtils';
import { SelectionCards } from './SelectionCards';
import type { SelectionEntry } from './catalogue';

const entries: SelectionEntry[] = Array.from({ length: 1000 }, (_, index) => ({
    source: 'backlog', category: 'backlog', selectionId: `backlog:${index}`,
    game: { id: String(index), title: `Item ${index}`, imagePath: '/cover.webp' },
}));
let scrollTop = 0;
let width = 600;
let resize: () => void;

beforeEach(() => {
    scrollTop = 0;
    width = 600;
    vi.stubGlobal('innerWidth', 600);
    vi.stubGlobal('innerHeight', 600);
    vi.stubGlobal('ResizeObserver', class {
        constructor(callback: () => void) { resize = callback; }
        observe() {}
        disconnect() {}
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        return { top: this.tagName === 'MAIN' ? 100 : 100 - scrollTop, width, height: 600, bottom: 700, left: 0, right: width, x: 0, y: 100, toJSON() {} };
    });
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
});
afterEach(() => vi.unstubAllGlobals());

function mount(list = entries) {
    const { wrapper, unmount, store } = setup([]);
    unmount();
    const onDetail = vi.fn();
    const view = (items: SelectionEntry[]) => <main style={{ overflow: 'auto' }}><SelectionCards entries={items} onDetail={onDetail} /></main>;
    const result = render(view(list), { wrapper });
    const main = result.container.querySelector('main')!;
    main.scrollTo = vi.fn((options?: ScrollToOptions | number, y?: number) => {
        scrollTop = typeof options === 'number' ? y ?? 0 : options?.top ?? 0;
        main.scrollTop = scrollTop;
    });
    return { ...result, store, onDetail, main, update: (items: SelectionEntry[]) => result.rerender(view(items)) };
}
function scroll(main: HTMLElement, top: number) {
    scrollTop = top;
    main.scrollTop = top;
    fireEvent.scroll(main);
}

it('bounds mounted cards and follows the page scroll container', () => {
    const { main } = mount();
    expect(screen.getAllByRole('img', { name: /^Item / }).length).toBeLessThan(20);
    expect(screen.getByRole('img', { name: 'Item 0' })).toBeInTheDocument();
    scroll(main, 6000);
    expect(screen.queryByRole('img', { name: 'Item 0' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Item 40' })).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /^Item / }).length).toBeLessThan(20);
});

it('recalculates two, three and six columns on resize and container width changes', () => {
    const { container } = mount();
    const card = (index: number) => screen.getByRole('img', { name: `Item ${index}` }).closest('.MuiCard-root')!.parentElement!;
    const grid = container.querySelector('main')!.firstElementChild!;
    const initialHeight = getComputedStyle(grid).height;
    const firstCard = card(0);
    expect(getComputedStyle(card(2)).top).not.toBe('0px');
    vi.stubGlobal('innerWidth', 1000);
    fireEvent.resize(window);
    expect(getComputedStyle(card(2)).top).toBe('0px');
    expect(getComputedStyle(card(3)).top).not.toBe('0px');
    vi.stubGlobal('innerWidth', 1300);
    fireEvent.resize(window);
    expect(getComputedStyle(card(5)).top).toBe('0px');
    expect(card(0)).toBe(firstCard);
    expect(getComputedStyle(grid).height).not.toBe(initialHeight);
    width = 900;
    act(() => resize());
    expect(Number.parseFloat(getComputedStyle(card(0)).width)).toBeCloseTo((900 - 40) / 6, 2);
});

it('returns to visible results when filtering or sorting after scrolling', () => {
    const { main, update } = mount();
    scroll(main, 6000);
    update(entries.slice(0, 2));
    expect(main.scrollTo).toHaveBeenCalled();
    expect(screen.getAllByRole('img', { name: /^(Item |Alpha|Beta)/ })).toHaveLength(2);
    update(entries);
    scroll(main, 6000);
    update([...entries].reverse());
    expect(screen.getByRole('img', { name: 'Item 999' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Item 40' })).not.toBeInTheDocument();
});

it('preserves detail and selection actions outside the initial viewport', () => {
    const { main, onDetail, store } = mount();
    scroll(main, 6000);
    fireEvent.click(screen.getByRole('img', { name: 'Item 40' }).closest('button')!);
    expect(onDetail).toHaveBeenCalledWith(entries[40]);
    fireEvent.click(screen.getByRole('button', { name: 'Add Item 40 to my selection' }));
    expect(store.getState().selection.ids).toContain('backlog:40');
    expect(screen.getByRole('button', { name: 'Remove Item 40 from my selection' })).toHaveAttribute('aria-pressed', 'true');
});

it('keeps focused card actions mounted while scrolling', () => {
    const { main } = mount();
    const action = screen.getByRole('button', { name: 'Add Item 0 to my selection' });
    act(() => action.focus());
    scroll(main, 6000);
    expect(action).toHaveFocus();
    expect(screen.getAllByRole('img', { name: /^Item / }).length).toBeLessThan(21);
});

it('handles empty and short lists, including published card links', () => {
    const { update } = mount([]);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    update(catalogue);
    expect(screen.getAllByRole('img', { name: /^(Item |Alpha|Beta)/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Alpha/ })).toHaveAttribute('href', '/games/detail/game-0');
});

it('keeps results mounted when a deep scroll exceeds the resized grid height', () => {
    const { main } = mount();
    scroll(main, 140000);
    vi.stubGlobal('innerWidth', 1300);
    fireEvent.resize(window);
    expect(screen.getByRole('img', { name: 'Item 999' })).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /^Item / }).length).toBeLessThan(20);
});

it('supports window scrolling when there is no scrolling ancestor', () => {
    const { wrapper, unmount } = setup([]);
    unmount();
    render(<SelectionCards entries={entries} onDetail={vi.fn()} />, { wrapper });
    scrollTop = 6000;
    fireEvent.scroll(window);
    expect(screen.getByRole('img', { name: 'Item 40' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Item 0' })).not.toBeInTheDocument();
});
