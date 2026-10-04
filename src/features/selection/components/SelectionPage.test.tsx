import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en.json';
import SelectionPage from './SelectionPage';
import * as sharing from '../sharing/sharing';
import { emptySelection } from '@/domain/selection/operations';
import { SELECTION_STORAGE_KEY, getSelectionSnapshot } from '../storage/store';
import type { SelectionEntry } from '@/domain/selection/types';

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(navigation.query), usePathname: () => '/selection', useRouter: () => navigation }));
vi.mock('@/i18n/routing', () => ({
    useRouter: () => navigation,
    getPathname: () => '/en/selection',
    Link: ({ href, children, ...props }: { href: string | { params: { id: string } }; children: React.ReactNode }) => <a {...props} href={typeof href === 'string' ? href : `/games/detail/${href.params.id}`}>{children}</a>,
}));
vi.mock('@/features/games/detail/GameDetailContent', () => ({ default: () => <div>Detail content</div> }));
const card = { id: 'same', title: 'Alpha', imagePath: '/cover.webp', url: 'https://youtube.com', url_type: 'VIDEO' as const };
const catalogue: SelectionEntry[] = [
    { source: 'published', category: 'games', selectionId: 'same', game: card },
    { source: 'published', category: 'dlcs', selectionId: 'same', game: { ...card, title: 'Expansion' } },
    { source: 'planning', category: 'planning', selectionId: 'same', game: { ...card, title: 'Upcoming', status: 'PENDING' } },
    { source: 'backlog', category: 'backlog', selectionId: 'same', game: { id: 'same', title: 'Waiting', imagePath: '/cover.webp' } },
];
const shared = { games: ['same', 'ghost'], dlcs: ['same'], planning: ['same'], backlog: ['same'] };
function mount(entries = catalogue) {
    return render(<NextIntlClientProvider locale="en" messages={messages}><SelectionPage catalogue={entries} /></NextIntlClientProvider>);
}
beforeEach(() => { navigation.query = ''; localStorage.clear(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });
function choose(label: string, option: string) {
    fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
    fireEvent.click(screen.getByRole('option', { name: option }));
}
it('keeps invalid shared links from displaying or sharing personal selection', async () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['same'] }));
    navigation.query = 'entries=!!!';
    const write = vi.spyOn(Storage.prototype, 'setItem');
    mount(); expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(await screen.findByText(messages.selection.invalid)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.selection.share })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.selection.import })).not.toBeInTheDocument();
    expect(write).not.toHaveBeenCalled();
});
it('keeps every shared card and detail read-only, and explicitly merges the complete document', async () => {
    const personal = { ...emptySelection(), games: ['saved'], backlog: ['missing'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(personal));
    navigation.query = `entries=${await sharing.encodeSelection(shared)}`;
    const write = vi.spyOn(Storage.prototype, 'setItem');
    mount(); await screen.findByRole('img', { name: 'Upcoming' });
    for (const entry of catalogue) {
        expect(screen.queryByRole('button', { name: `Add ${entry.game.title} to my selection` })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: `Remove ${entry.game.title} from my selection` })).not.toBeInTheDocument();
    }
    for (const title of ['Waiting', 'Upcoming']) {
        fireEvent.click(screen.getByRole('img', { name: title }).closest('button')!);
        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).queryByRole('button', { name: `Add ${title} to my selection` })).not.toBeInTheDocument();
        expect(within(dialog).queryByTestId('BookmarkBorderIcon')).not.toBeInTheDocument();
        expect(within(dialog).queryByTestId('BookmarkIcon')).not.toBeInTheDocument();
        fireEvent.click(within(dialog).getByRole('button', { name: messages.gameDetail.close }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
    expect(write).not.toHaveBeenCalled();
    choose(messages.selection.kinds, messages.selection.categories.games);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: messages.selection.import }));
    expect(getSelectionSnapshot().document).toEqual({ ...shared, games: ['saved', 'same', 'ghost'], backlog: ['missing', 'same'] });
});
it('ignores stale asynchronous decode results after navigation', async () => {
    let resolve!: (document: typeof shared | null) => void;
    vi.spyOn(sharing, 'decodeSelection').mockImplementation(param => param === 'pending' ? new Promise(done => { resolve = done; }) : Promise.resolve(shared));
    navigation.query = 'entries=pending';
    const view = mount(); expect(screen.getByRole('progressbar')).toBeInTheDocument();
    navigation.query = 'entries=current';
    view.rerender(<NextIntlClientProvider locale="en" messages={messages}><SelectionPage catalogue={catalogue} /></NextIntlClientProvider>);
    await screen.findByRole('img', { name: 'Alpha' });
    await act(async () => resolve(null));
    expect(screen.queryByText(messages.selection.invalid)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Alpha' })).toBeInTheDocument();
});
it('filters, sorts and paginates without changing storage and shares missing and hidden identifiers', async () => {
    const entries: SelectionEntry[] = Array.from({ length: 30 }, (_, index) => ({ source: 'published', category: 'games', selectionId: `item-${index}`, game: { ...card, id: `item-${index}`, title: index === 29 ? 'Item Zephyr' : `Item ${String(index).padStart(2, '0')}` } }));
    const document = { ...emptySelection(), games: entries.map(entry => entry.selectionId).concat('ghost'), backlog: ['same'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    mount([...entries, catalogue[3]]);
    expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: messages.common.loadMore }));
    expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(24);
    choose(messages.selection.kinds, messages.selection.categories.games);
    expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(12);
    choose(messages.gamesLibrary.sortForm.firstSort, messages.gamesLibrary.sortLabels.name);
    fireEvent.click(screen.getByRole('button', { name: messages.gamesLibrary.sortDirection.desc }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Zephyr' } });
    await waitFor(() => expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(1));
    expect(getSelectionSnapshot().document).toEqual(document); expect(write).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
    const url = new URL((await screen.findByRole('textbox', { name: messages.selection.shareLink }) as HTMLInputElement).value);
    expect(await sharing.decodeSelection(url.searchParams.get('entries')!)).toEqual(document);
}, 15000);
it('removes missing identifiers explicitly and reports a failed removal', async () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['ghost'] }));
    mount(); fireEvent.click(screen.getByRole('button', { name: messages.selection.categories.all }));
    const remove = await screen.findByRole('button', { name: 'Remove ghost from my selection' });
    const fail = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    fireEvent.click(remove);
    expect(await screen.findAllByText(messages.selection.storageUnavailable)).not.toHaveLength(0);
    expect(getSelectionSnapshot().document.games).toEqual(['ghost']);
    fail.mockRestore(); fireEvent.click(remove);
    expect(getSelectionSnapshot().document.games).toEqual([]);
});
it('keeps the clear dialog open when writing fails', async () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['same'] }));
    mount(); fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: messages.selection.clear }));
    expect(within(screen.getByRole('dialog')).getByText(messages.selection.storageUnavailable)).toBeInTheDocument();
    expect(getSelectionSnapshot().document.games).toEqual(['same']);
});
it('reports failed import without claiming it succeeded', async () => {
    navigation.query = `entries=${await sharing.encodeSelection(shared)}`;
    mount(); const button = await screen.findByRole('button', { name: messages.selection.import });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    fireEvent.click(button);
    expect(await screen.findAllByText(messages.selection.storageUnavailable)).not.toHaveLength(0);
    expect(button).toBeEnabled(); expect(getSelectionSnapshot().document).toEqual(emptySelection());
});

it('offers explicit recovery for invalid personal storage without silently overwriting it', async () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '{}');
    const write = vi.spyOn(Storage.prototype, 'setItem');
    mount();
    expect(screen.getByText(messages.selection.storageInvalid)).toBeInTheDocument();
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(SELECTION_STORAGE_KEY)).toBe('{}');
    fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: messages.selection.clear }));
    expect(getSelectionSnapshot().invalid).toBe(false);
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual(emptySelection());
});
it('keeps personal category controls independent when identifiers collide', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['same'], dlcs: ['same'] }));
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha from my selection' }));
    expect(getSelectionSnapshot().document).toEqual({ ...emptySelection(), dlcs: ['same'] });
    expect(screen.getByRole('button', { name: 'Remove Expansion from my selection' })).toHaveAttribute('aria-pressed', 'true');
});
