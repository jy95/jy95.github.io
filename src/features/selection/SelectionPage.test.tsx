import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
    expect(screen.getByRole('status')).toHaveTextContent('0 selected games');
    fireEvent.click(screen.getByRole('button', { name: 'Add Alpha to my selection' }));
    expect(screen.getByRole('status')).toHaveTextContent('1 selected game');
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
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 selected game'));
    expect(screen.getByText('1 game is no longer available in the catalogue.')).toBeInTheDocument();
    expect(store.getState().selection.ids).toEqual(['game-1']);
    fireEvent.click(screen.getByRole('button', { name: 'Add these games to my selection' }));
    expect(store.getState().selection.ids).toEqual(['game-1', 'game-0']);
    expect(screen.getByRole('button', { name: 'All games are in my selection' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Open my selection' })).toHaveAttribute('href', '/selection');
});

it('treats an empty compressed selection as an empty shared selection', async () => {
    navigation.query = await selectionQuery(emptySelection());
    setup(['game-1']);
    expect(await screen.findByText(en.selection.sharedEmpty)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 selected games');
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

it('filters selected games with the existing catalogue title field', async () => {
    setup(['game-0', 'game-1']);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove Beta from my selection' })).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('2 selected games');
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
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
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
function section(name: string) {
    const header = screen.getByRole('button', { name: new RegExp(`^${name} —`) });
    return { header, content: document.getElementById(header.getAttribute('aria-controls')!)! };
}

it.each(['en', 'fr'] as const)('separates categories, including published DLCs, with localized counts in %s', locale => {
    setup(allIds, locale, 'light', categorizedCatalogue);
    const labels = (locale === 'en' ? en : fr).selection.categories;
    for (const category of ['games', 'backlog', 'dlcs', 'planning'] as const) {
        const { header, content } = section(labels[category]);
        expect(header).toHaveAttribute('aria-expanded', 'true');
        const entries = categorizedCatalogue.filter(entry => entry.category === category);
        for (const entry of entries) expect(within(content).getByRole('img', { name: entry.game.title })).toBeInTheDocument();
    }
    expect(within(section(labels.games).content).queryByText('Expansion')).not.toBeInTheDocument();
});

it('retains headings and expansion while filtering and removing, including empty sections', async () => {
    setup(allIds, 'en', 'light', categorizedCatalogue);
    fireEvent.click(section('Backlog').header);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzzzzzzzz' } });
    await waitFor(() => expect(section('DLCs').header).toHaveTextContent('0 matching / 1 selected'));
    expect(within(section('DLCs').content).getByText(en.common.noResults)).toBeInTheDocument();
    expect(section('Backlog').header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    await screen.findByRole('button', { name: 'Remove Upcoming from my selection' });
    fireEvent.click(screen.getByRole('button', { name: 'Remove Upcoming from my selection' }));
    expect(section('Planning').header).toHaveTextContent('0 matching / 0 selected');
    expect(within(section('Planning').content).getByText(en.selection.sectionEmpty)).toBeInTheDocument();
    expect(section('Backlog').header).toHaveAttribute('aria-expanded', 'false');
});

it('sorts within each category without moving games between sections', () => {
    navigation.sort = 'title_desc';
    setup(allIds, 'en', 'light', categorizedCatalogue);
    const images = within(section('Games').content).getAllByRole('img');
    expect(images.map(image => image.getAttribute('aria-label'))).toEqual(['Beta', 'Alpha']);
    expect(within(section('DLCs').content).getByRole('img')).toHaveAttribute('aria-label', 'Expansion');
});

it.each([['Backlog', 'Waiting', 'true', 'false'], ['Planning', 'Upcoming', 'false', 'true']])('preserves %s detail behavior', (category, title, vote, related) => {
    setup(allIds, 'en', 'light', categorizedCatalogue);
    fireEvent.click(within(section(category).content).getByRole('button', { name: `${title} ${title}` }));
    const dialog = screen.getByRole('dialog', { name: title });
    expect(dialog).toHaveAttribute('data-vote', vote);
    expect(dialog).toHaveAttribute('data-related', related);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('imports and shares all categories with collapsed and filtered sections', async () => {
    const document = { ...emptySelection(), games: ['game-0', 'game-1'], backlog: ['42'], dlcs: ['dlc'], planning: ['planned'] };
    navigation.query = await selectionQuery(document);
    const { store } = setup([], 'en', 'light', categorizedCatalogue);
    await screen.findByRole('button', { name: en.selection.import });
    for (const name of ['Games', 'Backlog', 'DLCs', 'Planning']) fireEvent.click(section(name).header);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: en.selection.import }));
    expect(store.getState().selection.document).toEqual(document);
    fireEvent.click(screen.getByRole('button', { name: en.selection.share }));
    const url = new URL((await screen.findByRole('textbox', { name: en.selection.shareLink }) as HTMLInputElement).value);
    expect(await parseSharedSelection(url.searchParams)).toEqual({ kind: 'selection', document });
});
