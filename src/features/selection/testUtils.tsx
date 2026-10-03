import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, type ComponentProps } from 'react';
import { makeStore } from '@/redux/Store';
import { emptySelection } from './documentTypes';
import { getSelectionSnapshot, subscribeSelection } from './selectionPersistence';
import { SELECTION_STORAGE_KEY } from './storageFormat';
import SelectionPage from './SelectionPage';
import type { SelectionEntry } from './catalogue';
import type { GameFilters } from '@/types/gamesFilters';
import { messages } from './testMessages';
const { en, fr } = messages;

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), sort: undefined as GameFilters['sort'], mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => navigation.mobile }));
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

// Page tests exercise UI and selection state; transport has its own integration tests.
vi.mock('./sharing', async importOriginal => {
    const { normalizeSelectionDocument } = await import('./documentClassification');
    return {
        ...await importOriginal<typeof import('./sharing')>(),
        selectionQuery: async (document: unknown) => new URLSearchParams({ entries: JSON.stringify(normalizeSelectionDocument(document)) }).toString(),
        parseSharedSelection: async (params: import('./sharingQuery').SelectionSearchParams) => {
            const values = params.getAll('entries');
            if (values.length === 0) return { kind: 'absent' };
            const encoded = values[0];
            if (values.length !== 1 || !encoded) return { kind: 'error', error: 'invalid' };
            try { return { kind: 'selection', document: normalizeSelectionDocument(JSON.parse(encoded)) }; }
            catch { return { kind: 'error', error: 'invalid' }; }
        },
    };
});

export const catalogue: SelectionEntry[] = ['Alpha', 'Beta'].map((title, i) => ({
    source: 'published', category: 'games', selectionId: `game-${i}`, game: { id: `game-${i}`, title, imagePath: `/covers/game-${i}/cover.webp`, url_type: 'VIDEO', url: 'https://youtube.com', platform: i, releaseDate: `200${i}-01-01` },
}));

export function createProviders(ids: string[] = [], locale: 'en' | 'fr' = 'en', mode: 'light' | 'dark' = 'light') {
    const store = makeStore();
    const document = emptySelection();
    for (const id of ids) {
        const category = categorizedCatalogue.find(entry => entry.selectionId === id)?.category ?? 'games';
        document[category].push(id);
    }
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    const disconnect = subscribeSelection(() => {});
    disconnect();
    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}><NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : fr}><ThemeProvider theme={createTheme({ palette: { mode } })}>{children}</ThemeProvider></NextIntlClientProvider></Provider>;
    return { store, selection: { getState: getSelectionSnapshot }, wrapper };
}

export function setup(ids: string[] = [], locale: 'en' | 'fr' = 'en', mode: 'light' | 'dark' = 'light', entries = catalogue) {
    const providers = createProviders(ids, locale, mode);
    return { ...providers, ...render(<SelectionPage catalogue={entries} />, { wrapper: providers.wrapper }) };
}

export function chooseKind(name: string, locale: 'en' | 'fr' = 'en') {
    const select = screen.getByRole('combobox', { name: (locale === 'en' ? en : fr).selection.kinds });
    if (select instanceof HTMLSelectElement) {
        const option = within(select).getByRole('option', { name }) as HTMLOptionElement;
        fireEvent.change(select, { target: { value: option.value } });
    } else {
        fireEvent.mouseDown(select);
        fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name }));
    }
}

beforeEach(() => { navigation.query = ''; navigation.mobile = false; navigation.sort = undefined; navigation.push.mockClear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

export const categorizedCatalogue: SelectionEntry[] = [
    ...catalogue,
    { source: 'published', category: 'dlcs', selectionId: 'dlc', game: { ...catalogue[0].game, id: 'dlc', title: 'Expansion', url_type: 'VIDEO', url: 'https://youtube.com' } },
    { source: 'backlog', category: 'backlog', selectionId: '42', game: { id: '42', title: 'Waiting', imagePath: '/waiting.webp' } },
    { source: 'planning', category: 'planning', selectionId: 'planned', game: { ...catalogue[0].game, id: 'planned', title: 'Upcoming', url_type: 'VIDEO', url: 'https://youtube.com', status: 'PENDING' } },
];
export const allIds = categorizedCatalogue.map(entry => entry.selectionId);

export { navigation };
