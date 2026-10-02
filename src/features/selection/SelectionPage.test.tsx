import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { createTheme, getContrastRatio, ThemeProvider } from '@mui/material/styles';
import { useState, type ComponentProps } from 'react';
import { makeStore } from '@/redux/Store';
import { parseSharedSelection, selectionQuery, type SharedSelection } from './sharing';
import * as sharing from './sharing';
import { emptySelection, selectionIds } from './schema';
import { hydrateSelection } from './selectionSlice';
import SelectionPage from './SelectionPage';
import SelectionButton from './SelectionButton';
import type { SelectionEntry } from './catalogue';
import type { GameFilters } from '@/types/gamesFilters';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), sort: undefined as GameFilters['sort'] }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(navigation.query) }));
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: navigation.push }),
    getPathname: ({ locale }: { locale: string }) => `${locale === 'en' ? '/en' : ''}/selection`,
    Link: ({ href, locale: _locale, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string | { params: { id: string } }; locale?: string }) => <a {...props} href={typeof href === 'string' ? href : `/games/detail/${href.params.id}`} />,
}));
vi.mock('@/features/games/useGamesFilters', () => ({ useGamesFilters: () => {
    const [filters, setFilters] = useState<GameFilters>({ sort: navigation.sort });
    return { filters, updateFilters: (changes: Partial<GameFilters>) => setFilters(current => ({ ...current, ...changes })) };
} }));
vi.mock('@/redux/services/platformsAPI', () => ({ useGetPlatformsQuery: () => ({ data: [] }) }));
vi.mock('@/redux/services/genresAPI', () => ({ useGetGenresQuery: () => ({ data: [] }) }));
vi.mock('@/features/games/detail/GameDetailView', () => ({ default: ({ game, showVoteSection, showRelatedGames, onClose }: { game: { title: string }; showVoteSection: boolean; showRelatedGames: boolean; onClose: () => void }) => <div role="dialog" aria-label={game.title} data-vote={showVoteSection} data-related={showRelatedGames}><button onClick={onClose}>Close details</button></div> }));
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

const catalogue: SelectionEntry[] = ['Alpha', 'Beta'].map((title, i) => ({
    source: 'published', category: 'games', selectionId: `game-${i}`, game: { id: `game-${i}`, title, imagePath: `/covers/game-${i}/cover.webp`, url_type: 'VIDEO', url: 'https://youtube.com', platform: i, releaseDate: `200${i}-01-01` },
}));

function setup(ids: string[] = [], locale: 'en' | 'fr' = 'en', mode: 'light' | 'dark' = 'light', entries = catalogue) {
    const store = makeStore();
    store.dispatch(hydrateSelection(ids));
    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}><NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : fr}><ThemeProvider theme={createTheme({ palette: { mode } })}>{children}</ThemeProvider></NextIntlClientProvider></Provider>;
    return { store, ...render(<SelectionPage catalogue={entries} />, { wrapper }), wrapper };
}

function openKinds(locale: 'en' | 'fr' = 'en') {
    const select = screen.getByRole('combobox', { name: (locale === 'en' ? en : fr).selection.kinds });
    fireEvent.mouseDown(select);
    return screen.getByRole('listbox');
}

function toggleKind(name: string, locale: 'en' | 'fr' = 'en') {
    const listbox = openKinds(locale);
    fireEvent.click(within(listbox).getByRole('option', { name }));
    fireEvent.keyDown(listbox, { key: 'Escape' });
}

beforeEach(() => { navigation.query = ''; navigation.sort = undefined; navigation.push.mockClear(); });
afterEach(() => { vi.restoreAllMocks(); });

it.each(['en', 'fr'] as const)('shows localized empty selection and catalogue link in %s', locale => {
    setup([], locale);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(locale === 'en' ? en.selection.title : fr.selection.title);
    expect(screen.getByText(locale === 'en' ? en.selection.empty : fr.selection.empty)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: locale === 'en' ? en.selection.browse : fr.selection.browse })).toHaveAttribute('href', '/games');
});

it.each(['light', 'dark'] as const)('removes games and synchronizes multiple accessible controls in %s mode', mode => {
    const { store, wrapper } = setup(['game-0'], 'en', mode);
    render(<SelectionButton id="game-0" title="Alpha" />, { wrapper });
    const buttons = screen.getAllByRole('button', { name: 'Remove Alpha from my selection' });
    expect(buttons).toHaveLength(2);
    buttons.forEach(button => expect(button).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.click(buttons[0]);
    expect(store.getState().selection.ids).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent('0 selected items');
    fireEvent.click(screen.getByRole('button', { name: 'Add Alpha to my selection' }));
    expect(screen.getByRole('status')).toHaveTextContent('1 selected item');
    expect(navigation.push).not.toHaveBeenCalled();
});

it('confirms clearing the entire selection and supports cancel', async () => {
    const { store } = setup(['game-0', 'game-1']);
    fireEvent.click(screen.getByRole('button', { name: 'Clear my selection' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(store.getState().selection.ids).toHaveLength(2);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Clear my selection' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear my selection' }));
    expect(store.getState().selection.ids).toEqual([]);
});

it('displays shared games without overwriting personal games, ignores outdated IDs and imports once', async () => {
    navigation.query = await selectionQuery({ ...emptySelection(), games: ['game-0', 'game-0', 'outdated'] });
    const { store } = setup(['game-1']);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 selected item'));
    expect(screen.getByText('1 item is no longer available in the catalogue.')).toBeInTheDocument();
    expect(store.getState().selection.ids).toEqual(['game-1']);
    fireEvent.click(screen.getByRole('button', { name: 'Add these items to my selection' }));
    expect(store.getState().selection.ids).toEqual(['game-1', 'game-0']);
    expect(screen.getByRole('button', { name: 'All items are in my selection' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Open my selection' })).toHaveAttribute('href', '/selection');
});

it('treats an empty compressed selection as an empty shared selection', async () => {
    navigation.query = await selectionQuery(emptySelection());
    setup(['game-1']);
    expect(await screen.findByText(en.selection.sharedEmpty)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 selected items');
});

it.each(['games=game-0', 'games=', 'games=!!!'])('keeps the personal selection for a games-only query: %s', async query => {
    navigation.query = query;
    const { store } = setup(['game-1']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.selection.title);
    expect(screen.getByRole('button', { name: 'Remove Beta from my selection' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.selection.import })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: en.selection.openOwn })).not.toBeInTheDocument();
    await waitFor(() => expect(store.getState().selection.ids).toEqual(['game-1']));
    expect(screen.queryByRole('button', { name: 'Add Alpha to my selection' })).not.toBeInTheDocument();
});

it.each(['en', 'fr'] as const)('generates a locale-aware URL and provides manual copying when clipboard is denied in %s', async locale => {
    setup(['game-0', 'game-1'], locale);
    const text = locale === 'en' ? en.selection : fr.selection;
    fireEvent.click(screen.getByRole('button', { name: text.share }));
    const url = new URL((await screen.findByRole('textbox', { name: text.shareLink }) as HTMLInputElement).value);
    expect(url.pathname).toBe(locale === 'en' ? '/en/selection' : '/selection');
    const decoded = await parseSharedSelection(url.searchParams);
    expect(decoded.kind).toBe('selection');
    if (decoded.kind === 'selection') expect(selectionIds(decoded.document)).toEqual(['game-0', 'game-1']);
    fireEvent.click(screen.getByRole('button', { name: text.copy }));
    expect(await screen.findByText(text.copyFallback)).toBeInTheDocument();
});

it('filters selected items with the existing catalogue title field', async () => {
    setup(['game-0', 'game-1']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('2 selected items');
});

it('copies the generated link when clipboard access succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: 'Share selection' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Copy link' }));
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/en/selection?selection='));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
});

it('loads a compressed selection asynchronously and imports categorized games', async () => {
    navigation.query = await selectionQuery({ version: 2, games: ['game-0'], dlcs: [], backlog: [], planning: [] });
    const { store } = setup(['game-1']);
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: en.selection.import })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: en.selection.import }));
    expect(store.getState().selection.document.games).toEqual(['game-1', 'game-0']);
});
it('shows localized decode errors without offering import', async () => {
    navigation.query = 'selection=!!!';
    setup([], 'fr');
    expect(await screen.findByText(fr.selection.invalid)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: fr.selection.import })).not.toBeInTheDocument();
    expect(screen.queryByText(fr.selection.sharedEmpty)).not.toBeInTheDocument();
});
it('disables sharing during encoding and reports missing compression support', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(screen.getByRole('button', { name: en.selection.share })).toBeDisabled();
    expect(screen.getByText(en.selection.processing)).toBeInTheDocument();
    expect(await screen.findByText(en.selection.compressionUnavailable)).toBeInTheDocument();
    vi.unstubAllGlobals();
});
it('ignores a stale decode after query parameters change', async () => {
    let resolve!: (result: SharedSelection) => void;
    const realDecode = sharing.parseSharedSelection;
    const decode = vi.spyOn(sharing, 'parseSharedSelection').mockImplementation(params => params.get('selection') === 'pending' ? new Promise(done => { resolve = done; }) : realDecode(params));
    navigation.query = 'selection=pending';
    const { rerender } = setup();
    navigation.query = await selectionQuery({ ...emptySelection(), games: ['game-1'] });
    rerender(<SelectionPage catalogue={catalogue} />);
    await screen.findByRole('button', { name: 'Add Beta to my selection' });
    resolve({ kind: 'error', error: 'invalid' });
    await waitFor(() => expect(screen.queryByText(en.selection.invalid)).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Add Beta to my selection' })).toBeInTheDocument();
    decode.mockRestore();
});

it.each([
    ['query change', 'success'],
    ['query change', 'error'],
    ['unmount', 'success'],
    ['unmount', 'error'],
] as const)('ignores pending encoding after %s (%s)', async (change, outcome) => {
    let resolve!: (query: string) => void;
    let reject!: (error: Error) => void;
    const pending = new Promise<string>((done, fail) => { resolve = done; reject = fail; });
    const encode = vi.spyOn(sharing, 'selectionQuery').mockReturnValue(pending);
    const { rerender, unmount, container } = setup(['game-0']);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    expect(encode).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: en.selection.share })).toBeDisabled();

    if (change === 'query change') {
        navigation.query = 'title=Beta';
        rerender(<SelectionPage catalogue={catalogue} />);
        expect(screen.getByRole('button', { name: en.selection.share })).toBeEnabled();
    } else {
        unmount();
    }

    await act(async () => {
        if (outcome === 'success') resolve('selection=encoded');
        else reject(new Error('compressionUnavailable'));
        await pending.catch(() => undefined);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.compressionUnavailable)).not.toBeInTheDocument();
    expect(screen.queryByText(en.selection.processing)).not.toBeInTheDocument();
    if (change === 'unmount') expect(container).toBeEmptyDOMElement();
    else expect(screen.getByRole('button', { name: en.selection.share })).toBeEnabled();
});

it('shares the full selection while display filters hide games', async () => {
    setup(['game-0', 'game-1']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    const url = new URL((await screen.findByRole('textbox', { name: en.selection.shareLink }) as HTMLInputElement).value);
    expect(await parseSharedSelection(url.searchParams)).toEqual({ kind: 'selection', document: { ...emptySelection(), games: ['game-0', 'game-1'] } });
});


const categorizedCatalogue: SelectionEntry[] = [
    ...catalogue,
    { source: 'published', category: 'dlcs', selectionId: 'dlc', game: { ...catalogue[0].game, id: 'dlc', title: 'Expansion', url_type: 'VIDEO', url: 'https://youtube.com' } },
    { source: 'backlog', category: 'backlog', selectionId: 'backlog:42', game: { id: '42', title: 'Waiting', imagePath: '/waiting.webp' } },
    { source: 'planning', category: 'planning', selectionId: 'planned', game: { ...catalogue[0].game, id: 'planned', title: 'Upcoming', url_type: 'VIDEO', url: 'https://youtube.com', status: 'PENDING' } },
];
const allIds = categorizedCatalogue.map(entry => entry.selectionId);
it.each(['en', 'fr'] as const)('enables all kinds and labels each category icon in %s', locale => {
    setup(allIds, locale, 'light', categorizedCatalogue);
    const labels = (locale === 'en' ? en : fr).selection.categories;
    const icons = { games: 'SportsEsportsIcon', dlcs: 'ExtensionIcon', planning: 'ScheduleIcon', backlog: 'HourglassEmptyIcon' };
    const select = screen.getByRole('combobox', { name: (locale === 'en' ? en : fr).selection.kinds });
    expect(select).toHaveAttribute('aria-labelledby', expect.stringContaining(select.id + '-label'));
    for (const label of Object.values(labels)) expect(within(select).getByText(label)).toBeInTheDocument();
    const listbox = openKinds(locale);
    for (const category of ['games', 'backlog', 'dlcs', 'planning'] as const) {
        const option = within(listbox).getByRole('option', { name: labels[category] });
        expect(option).toHaveAttribute('aria-selected', 'true');
        expect(within(option).getByTestId(icons[category])).toHaveAttribute('aria-hidden', 'true');
    }
    fireEvent.keyDown(listbox, { key: 'Escape' });
    for (const category of ['games', 'backlog', 'dlcs', 'planning'] as const) {
        const badges = screen.getAllByRole('img', { name: labels[category] });
        expect(badges).toHaveLength(categorizedCatalogue.filter(entry => entry.category === category).length);
        badges.forEach(badge => expect(within(badge).getByTestId(icons[category])).toBeInTheDocument());
    }
});

it.each(['en', 'fr'] as const)('toggles individual kinds and keeps controls when every kind is unchecked in %s', locale => {
    const text = (locale === 'en' ? en : fr).selection;
    const { store } = setup(allIds, locale, 'light', categorizedCatalogue);
    const document = store.getState().selection.document;
    for (const category of ['games', 'dlcs', 'planning', 'backlog'] as const) {
        toggleKind(text.categories[category], locale);
        for (const entry of categorizedCatalogue.filter(entry => entry.category === category)) {
            expect(screen.queryByRole('img', { name: entry.game.title })).not.toBeInTheDocument();
        }
    }
    expect(screen.getByText((locale === 'en' ? en : fr).common.noResults)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText(text.empty)).not.toBeInTheDocument();
    expect(store.getState().selection.document).toEqual(document);
    expect(screen.getByRole('combobox', { name: text.kinds })).toBeInTheDocument();
    const listbox = openKinds(locale);
    within(listbox).getAllByRole('option').forEach(option => expect(option).toHaveAttribute('aria-selected', 'false'));
    fireEvent.keyDown(listbox, { key: 'Escape' });
    toggleKind(text.categories.dlcs, locale);
    expect(screen.getByRole('img', { name: 'Expansion' })).toBeInTheDocument();
});

it('combines kinds with catalogue filtering and sorts the unified grid', async () => {
    navigation.sort = 'title_desc';
    setup(allIds, 'en', 'light', categorizedCatalogue);
    const covers = () => screen.getAllByRole('img').filter(image => !image.querySelector('svg')).map(image => image.getAttribute('aria-label'));
    expect(covers()).toEqual(['Waiting', 'Upcoming', 'Expansion', 'Beta', 'Alpha']);
    toggleKind('Backlog');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(covers()).toEqual(['Expansion', 'Alpha']));
    toggleKind('DLCs');
    expect(covers()).toEqual(['Alpha']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzzzzzzzz' } });
    await screen.findByText(en.common.noResults);
    expect(screen.getByRole('combobox', { name: en.selection.kinds })).toBeInTheDocument();
});

it.each([['Waiting', 'true', 'false'], ['Upcoming', 'false', 'true']])('preserves %s detail behavior', (title, vote, related) => {
    setup(allIds, 'en', 'light', categorizedCatalogue);
    fireEvent.click(screen.getByRole('img', { name: title }).closest('button')!);
    const dialog = screen.getByRole('dialog', { name: title });
    expect(dialog).toHaveAttribute('data-vote', vote);
    expect(dialog).toHaveAttribute('data-related', related);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it.each([['Alpha', 'game-0'], ['Expansion', 'dlc']])('preserves published %s navigation and detail links in a mixed grid', (title, id) => {
    setup(allIds, 'en', 'light', categorizedCatalogue);
    fireEvent.click(screen.getByRole('img', { name: title }).closest('button')!);
    expect(navigation.push).toHaveBeenCalledWith({ pathname: '/video/[id]', params: { id } });
    navigation.push.mockClear();
    fireEvent.click(screen.getByRole('link', { name: `View details for ${title}` }));
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: `Remove ${title} from my selection` })).toBeInTheDocument();
});

it.each(['en', 'fr'] as const)('imports and shares all categories when every kind is hidden in %s', async locale => {
    const text = (locale === 'en' ? en : fr).selection;
    const document = { ...emptySelection(), games: ['game-0', 'game-1'], backlog: ['42'], dlcs: ['dlc'], planning: ['planned'] };
    navigation.query = await selectionQuery(document);
    const { store } = setup([], locale, 'light', categorizedCatalogue);
    await screen.findByRole('button', { name: text.import });
    for (const name of Object.values(text.categories)) toggleKind(name, locale);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: text.import }));
    expect(store.getState().selection.document).toEqual(document);
    fireEvent.click(screen.getByRole('button', { name: text.share }));
    const url = new URL((await screen.findByRole('textbox', { name: text.shareLink }) as HTMLInputElement).value);
    expect(await parseSharedSelection(url.searchParams)).toEqual({ kind: 'selection', document });
});

it.each(['en', 'fr'] as const)('supports keyboard opening, toggling and Escape with focus restoration in %s', locale => {
    setup(allIds, locale, 'light', categorizedCatalogue);
    const text = (locale === 'en' ? en : fr).selection;
    const select = screen.getByRole('combobox', { name: text.kinds });
    select.focus();
    expect(select).toHaveFocus();
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    const listbox = screen.getByRole('listbox');
    const option = within(listbox).getByRole('option', { name: text.categories.games });
    expect(option).toHaveFocus();
    fireEvent.keyDown(option, { key: 'Enter' });
    fireEvent.keyUp(option, { key: 'Enter' });
    expect(option).toHaveAttribute('aria-selected', 'false');
    fireEvent.keyDown(option, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(select).toHaveFocus();
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
});

it.each(['light', 'dark'] as const)('uses contrasting theme colors for category badges in %s mode', mode => {
    setup(allIds, 'en', mode, categorizedCatalogue);
    const badge = screen.getAllByRole('img', { name: 'Games' })[0];
    const theme = createTheme({ palette: { mode } });
    expect(badge).toHaveStyle({ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary });
    // Composite the light theme's translucent text over its paper background.
    const foreground = mode === 'light' ? '#212121' : theme.palette.text.primary;
    expect(getContrastRatio(foreground, theme.palette.background.paper)).toBeGreaterThan(4.5);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
});
