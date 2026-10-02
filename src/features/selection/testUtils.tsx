import { fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, type ComponentProps } from 'react';
import { makeStore } from '@/redux/Store';
import { hydrateSelection } from './selectionSlice';
import SelectionPage from './SelectionPage';
import type { SelectionEntry } from './catalogue';
import type { GameFilters } from '@/types/gamesFilters';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), sort: undefined as GameFilters['sort'] }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => false }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(navigation.query) }));
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: navigation.push }),
    getPathname: ({ locale }: { locale: string }) => `${locale === 'en' ? '/en' : ''}/selection`,
    Link: ({ href, locale, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string | { params: { id: string } }; locale?: string }) => <a {...props} lang={locale} href={typeof href === 'string' ? href : `/games/detail/${href.params.id}`} />,
}));
vi.mock('@/features/games/useGamesFilters', () => ({ useGamesFilters: () => {
    const [filters, setFilters] = useState<GameFilters>({ sort: navigation.sort });
    return { filters, updateFilters: (changes: Partial<GameFilters>) => setFilters(current => ({ ...current, ...changes })) };
} }));
vi.mock('@/redux/services/platformsAPI', () => ({ useGetPlatformsQuery: () => ({ data: [] }) }));
vi.mock('@/redux/services/genresAPI', () => ({ useGetGenresQuery: () => ({ data: [] }) }));
vi.mock('@/features/games/detail/GameDetailView', () => ({ default: ({ game, showVoteSection, showRelatedGames, onClose }: { game: { title: string }; showVoteSection: boolean; showRelatedGames: boolean; onClose: () => void }) => <div role="dialog" aria-label={game.title} data-vote={showVoteSection} data-related={showRelatedGames}><button onClick={onClose}>Close details</button></div> }));
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

export const catalogue: SelectionEntry[] = ['Alpha', 'Beta'].map((title, i) => ({
    source: 'published', category: 'games', selectionId: `game-${i}`, game: { id: `game-${i}`, title, imagePath: `/covers/game-${i}/cover.webp`, url_type: 'VIDEO', url: 'https://youtube.com', platform: i, releaseDate: `200${i}-01-01` },
}));

export function setup(ids: string[] = [], locale: 'en' | 'fr' = 'en', mode: 'light' | 'dark' = 'light', entries = catalogue) {
    const store = makeStore();
    store.dispatch(hydrateSelection(ids));
    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}><NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : fr}><ThemeProvider theme={createTheme({ palette: { mode } })}>{children}</ThemeProvider></NextIntlClientProvider></Provider>;
    return { store, ...render(<SelectionPage catalogue={entries} />, { wrapper }), wrapper };
}

export function openKinds(locale: 'en' | 'fr' = 'en') {
    const select = screen.getByRole('combobox', { name: (locale === 'en' ? en : fr).selection.kinds });
    fireEvent.mouseDown(select);
    return screen.getByRole('listbox');
}

export function toggleKind(name: string, locale: 'en' | 'fr' = 'en') {
    const listbox = openKinds(locale);
    fireEvent.click(within(listbox).getByRole('option', { name }));
    fireEvent.keyDown(listbox, { key: 'Escape' });
}

beforeEach(() => { navigation.query = ''; navigation.sort = undefined; navigation.push.mockClear(); });
afterEach(() => { vi.restoreAllMocks(); });

export const categorizedCatalogue: SelectionEntry[] = [
    ...catalogue,
    { source: 'published', category: 'dlcs', selectionId: 'dlc', game: { ...catalogue[0].game, id: 'dlc', title: 'Expansion', url_type: 'VIDEO', url: 'https://youtube.com' } },
    { source: 'backlog', category: 'backlog', selectionId: 'backlog:42', game: { id: '42', title: 'Waiting', imagePath: '/waiting.webp' } },
    { source: 'planning', category: 'planning', selectionId: 'planned', game: { ...catalogue[0].game, id: 'planned', title: 'Upcoming', url_type: 'VIDEO', url: 'https://youtube.com', status: 'PENDING' } },
];
export const allIds = categorizedCatalogue.map(entry => entry.selectionId);

export { navigation };
