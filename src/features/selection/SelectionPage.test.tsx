import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, type ComponentProps } from 'react';
import { makeStore } from '@/redux/Store';
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
    source: 'published', selectionId: `game-${i}`, game: { id: `game-${i}`, title, imagePath: `/covers/game-${i}/cover.webp`, url_type: 'VIDEO', url: 'https://youtube.com', platform: i, releaseDate: `200${i}-01-01` },
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

it('displays shared games without overwriting personal games, ignores outdated IDs and imports once', () => {
    navigation.query = 'games=game-0,game-0,outdated,!!!';
    const { store } = setup(['game-1']);
    expect(screen.getByRole('status')).toHaveTextContent('1 selected game');
    expect(screen.getByText('1 game is no longer available in the catalogue.')).toBeInTheDocument();
    expect(store.getState().selection.ids).toEqual(['game-1']);
    fireEvent.click(screen.getByRole('button', { name: 'Add these games to my selection' }));
    expect(store.getState().selection.ids).toEqual(['game-1', 'game-0']);
    expect(screen.getByRole('button', { name: 'All games are in my selection' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Open my selection' })).toHaveAttribute('href', '/selection');
});

it('treats an invalid-only shared URL as an empty shared selection', () => {
    navigation.query = 'games=!!!';
    setup(['game-1']);
    expect(screen.getByText(en.selection.sharedEmpty)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 selected games');
});

it.each(['en', 'fr'] as const)('generates a locale-aware URL and provides manual copying when clipboard is denied in %s', async locale => {
    setup(['game-0', 'game-1'], locale);
    const text = locale === 'en' ? en.selection : fr.selection;
    fireEvent.click(screen.getByRole('button', { name: text.share }));
    const url = new URL((screen.getByRole('textbox', { name: text.shareLink }) as HTMLInputElement).value);
    expect(url.pathname).toBe(locale === 'en' ? '/en/selection' : '/selection');
    expect(url.searchParams.get('games')).toBe('game-0,game-1');
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
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/en/selection?games=game-0'));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
});
