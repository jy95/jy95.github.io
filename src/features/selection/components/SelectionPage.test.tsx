import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en.json';
import SelectionPage from './SelectionPage';
import SelectionPageLoader from './SelectionPageLoader';
import SelectionButton from './SelectionButton';
import * as sharing from '../sharing/sharing';
import { emptySelection } from '@/domain/selection/operations';
import { SELECTION_STORAGE_KEY, getSelectionSnapshot } from '../storage/store';
import type { SelectionEntry } from '@/domain/selection/types';

const query = vi.hoisted(() => vi.fn());
vi.mock('@/redux/services/selectionAPI', () => ({ useGetSelectionCatalogueQuery: query }));
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
const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const nativeShare = Object.getOwnPropertyDescriptor(navigator, 'share');
beforeEach(() => { navigation.query = ''; localStorage.clear(); vi.clearAllMocks(); });
afterEach(() => {
    cleanup(); vi.restoreAllMocks(); localStorage.clear();
    if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
    if (nativeShare) Object.defineProperty(navigator, 'share', nativeShare);
    else Reflect.deleteProperty(navigator, 'share');
});
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
    expect(screen.getByRole('button', { name: messages.selection.imported })).toBeDisabled();
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
it('cleans missing identifiers before filtering, sorting, pagination and sharing', async () => {
    const entries: SelectionEntry[] = Array.from({ length: 30 }, (_, index) => ({ source: 'published', category: 'games', selectionId: `item-${index}`, game: { ...card, id: `item-${index}`, title: index === 29 ? 'Item Zephyr' : `Item ${String(index).padStart(2, '0')}` } }));
    const document = { ...emptySelection(), games: entries.map(entry => entry.selectionId).concat('ghost'), backlog: ['same'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const cleaned = { ...document, games: entries.map(entry => entry.selectionId) };
    mount([...entries, catalogue[3]]);
    expect(write).toHaveBeenCalledOnce();
    write.mockClear();
    expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: messages.common.loadMore }));
    expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(24);
    choose(messages.selection.kinds, messages.selection.categories.games);
    expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(12);
    choose(messages.gamesLibrary.sortForm.firstSort, messages.common.sort.fields.name);
    fireEvent.click(screen.getByRole('button', { name: messages.common.sort.direction.desc }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Zephyr' } });
    await waitFor(() => expect(screen.getAllByRole('img', { name: /^Item/ })).toHaveLength(1));
    expect(getSelectionSnapshot().document).toEqual(cleaned); expect(write).not.toHaveBeenCalled();
    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue(undefined);
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
    await waitFor(() => expect(share).toHaveBeenCalledOnce());
    expect(writeText).toHaveBeenCalledExactlyOnceWith(share.mock.calls[0][0].url);
    const url = new URL(share.mock.calls[0][0].url ?? '');
    expect(await sharing.decodeSelection(url.searchParams.get('entries') ?? '')).toEqual(cleaned);
    expect(getSelectionSnapshot().document).toEqual(cleaned); expect(write).not.toHaveBeenCalled();
}, 15000);
it('silently cleans personal missing identifiers and preserves valid removal controls', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['same', 'ghost'], dlcs: ['same', 'ghost'] }));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    mount([catalogue[0]]);
    expect(getSelectionSnapshot().document).toEqual({ ...emptySelection(), games: ['same'] });
    expect(write).toHaveBeenCalledOnce();
    expect(screen.queryByText(/no longer available/)).not.toBeInTheDocument();
    expect(screen.queryByText('ghost')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove ghost from my selection' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Alpha from my selection' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1');
});
it.each(['getItem', 'setItem'] as const)('reports cleanup %s failures without repeated writes', method => {
    const document = { ...emptySelection(), games: ['same', 'ghost'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    const failure = vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new Error('blocked'); });
    const view = mount();
    expect(screen.getByText(messages.selection.storageUnavailable)).toBeInTheDocument();
    expect(screen.queryByText(/no longer available/)).not.toBeInTheDocument();
    const attempts = failure.mock.calls.length;
    view.rerender(<NextIntlClientProvider locale="en" messages={messages}><SelectionPage catalogue={catalogue} /></NextIntlClientProvider>);
    expect(failure).toHaveBeenCalledTimes(attempts);
    if (method === 'setItem') {
        expect(failure).toHaveBeenCalledOnce();
        expect(getSelectionSnapshot().document).toEqual(document);
    }
});
it('does not write when all personal identifiers resolve', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['same'] }));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    mount();
    expect(write).not.toHaveBeenCalled();
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

it('restores personal document authority after leaving a shared selection', async () => {
    const personal = { ...emptySelection(), backlog: ['same', 'missing-personal'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(personal));
    navigation.query = `entries=${await sharing.encodeSelection(shared)}`;
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const view = mount();
    await screen.findByRole('img', { name: 'Alpha' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(messages.selection.sharedTitle);
    expect(screen.queryByText('ghost')).not.toBeInTheDocument();
    expect(screen.queryByText(/no longer available/)).not.toBeInTheDocument();
    expect(getSelectionSnapshot().document).toEqual(personal);
    expect(write).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Remove ghost from my selection' })).not.toBeInTheDocument();

    navigation.query = '';
    view.rerender(<NextIntlClientProvider locale="en" messages={messages}><SelectionPage catalogue={catalogue} /></NextIntlClientProvider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(messages.selection.title);
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Waiting from my selection' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove missing-personal from my selection' })).not.toBeInTheDocument();
    expect(getSelectionSnapshot().document).toEqual({ ...emptySelection(), backlog: ['same'] });
    expect(write).toHaveBeenCalledOnce();
});

it('synchronizes personal cards with catalogue selection controls', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), games: ['same'] }));
    mount();
    render(<NextIntlClientProvider locale="en" messages={messages}><SelectionButton id="same" category="games" title="Catalogue Alpha" /></NextIntlClientProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Catalogue Alpha from my selection' }));
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Catalogue Alpha to my selection' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Add Catalogue Alpha to my selection' }));
    expect(screen.getByRole('button', { name: 'Remove Alpha from my selection' })).toHaveAttribute('aria-pressed', 'true');
});

it.each([
    { isLoading: true },
    { isLoading: false, error: { status: 500 }, data: [] },
])('does not clean personal storage before successful catalogue loading: %j', state => {
    const document = { ...emptySelection(), games: ['ghost'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    const write = vi.spyOn(Storage.prototype, 'setItem');
    query.mockReturnValue(state);
    render(<NextIntlClientProvider locale="en" messages={messages}><SelectionPageLoader /></NextIntlClientProvider>);
    expect(write).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(SELECTION_STORAGE_KEY)!)).toEqual(document);
});
