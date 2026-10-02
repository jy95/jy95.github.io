import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(navigation.query) }));
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: navigation.push }),
    getPathname: ({ locale }: { locale: string }) => `${locale === 'en' ? '/en' : ''}/selection`,
    Link: ({ href, locale: _locale, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string | { params: { id: string } }; locale?: string }) => <a {...props} href={typeof href === 'string' ? href : `/games/detail/${href.params.id}`} />,
}));
vi.mock('@/features/games/useGamesFilters', () => ({ useGamesFilters: () => {
    const [filters, setFilters] = useState<GameFilters>({});
    return { filters, updateFilters: (changes: Partial<GameFilters>) => setFilters(current => ({ ...current, ...changes })) };
} }));
vi.mock('@/redux/services/platformsAPI', () => ({ useGetPlatformsQuery: () => ({ data: [] }) }));
vi.mock('@/redux/services/genresAPI', () => ({ useGetGenresQuery: () => ({ data: [] }) }));
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

const catalogue: SelectionEntry[] = ['Alpha', 'Beta'].map((title, i) => ({
    source: 'published', category: 'games', selectionId: `game-${i}`, game: { id: `game-${i}`, title, imagePath: `/covers/game-${i}/cover.webp`, url_type: 'VIDEO', url: 'https://youtube.com', platform: i, releaseDate: `200${i}-01-01` },
}));

function setup(ids: string[] = [], locale: 'en' | 'fr' = 'en', mode: 'light' | 'dark' = 'light') {
    const store = makeStore();
    store.dispatch(hydrateSelection(ids));
    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}><NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : fr}><ThemeProvider theme={createTheme({ palette: { mode } })}>{children}</ThemeProvider></NextIntlClientProvider></Provider>;
    return { store, ...render(<SelectionPage catalogue={catalogue} />, { wrapper }), wrapper };
}

beforeEach(() => { navigation.query = ''; navigation.push.mockClear(); });

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
