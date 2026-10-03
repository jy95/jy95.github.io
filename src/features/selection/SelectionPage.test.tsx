import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { useState, type ComponentProps } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import en from '../../../messages/en.json';
import SelectionPage from './SelectionPage';
import { emptySelection, type SelectionDocument } from './selectionDocument';
import { SELECTION_STORAGE_KEY, getSelectionSnapshot } from './selectionStore';
import { decodeSelection, encodeSelection } from './sharing';
import type { SelectionEntry } from './catalogue';
import type { GameFilters } from '@/types/gamesFilters';

const nav = vi.hoisted(() => ({ query: '' }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(nav.query) }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => true })); // native selects
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: vi.fn() }),
    getPathname: ({ locale }: { locale: string }) => `${locale === 'en' ? '/en' : ''}/selection`,
    Link: ({ href, locale: _locale, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string | { params: { id: string } }; locale?: string }) =>
        <a {...props} href={typeof href === 'string' ? href : `/games/detail/${href.params.id}`} />,
}));
vi.mock('@/features/games/useGamesFilters', () => ({
    useGamesFilters: () => {
        const [filters, setFilters] = useState<GameFilters>({});
        return { filters, updateFilters: (changes: Partial<GameFilters>) => setFilters(current => ({ ...current, ...changes })) };
    },
}));
vi.mock('@/redux/services/platformsAPI', () => ({ useGetPlatformsQuery: () => ({ data: [] }) }));
vi.mock('@/redux/services/genresAPI', () => ({ useGetGenresQuery: () => ({ data: [] }) }));
vi.mock('@/features/games/detail/GameDetailView', () => ({ default: () => <div role="dialog" /> }));
vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));

const published = (id: string, title: string, category: 'games' | 'dlcs' = 'games'): SelectionEntry => ({
    source: 'published', category, selectionId: id,
    game: { id, title, imagePath: `/covers/${id}.webp`, url: 'https://youtube.com', url_type: 'VIDEO' },
});
const catalogue: SelectionEntry[] = [
    published('a', 'Alpha'), published('b', 'Beta'), published('d', 'Expansion', 'dlcs'),
    { source: 'backlog', category: 'backlog', selectionId: '42', game: { id: '42', title: 'Waiting', imagePath: '/w.webp' } },
];
const text = en.selection;

function setup(saved: Partial<SelectionDocument> = {}) {
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({ ...emptySelection(), ...saved }));
    return render(
        <NextIntlClientProvider locale="en" messages={en}><SelectionPage catalogue={catalogue} /></NextIntlClientProvider>,
    );
}
const chooseKind = (value: string) =>
    fireEvent.change(screen.getByRole('combobox', { name: text.kinds }), { target: { value } });

beforeEach(() => { nav.query = ''; localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('shows the empty state with a catalogue link', async () => {
    setup();
    expect(await screen.findByText(text.empty)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: text.browse })).toHaveAttribute('href', '/games');
});

it('lists saved entries and removing one updates the store and the count', async () => {
    setup({ games: ['a', 'b', 'gone'] });
    await screen.findByRole('img', { name: 'Alpha' });
    expect(screen.getByText('1 item is no longer available in the catalogue.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha from my selection' }));
    expect(getSelectionSnapshot().document.games).toEqual(['b', 'gone']);
    expect(screen.getByRole('status')).toHaveTextContent('1 selected item');
});

it('filters by kind and title as presentation only', async () => {
    const saved = { games: ['a'], dlcs: ['d'], backlog: ['42'] };
    setup(saved);
    await screen.findByRole('img', { name: 'Alpha' });
    chooseKind('backlog');
    expect(screen.getByRole('img', { name: 'Waiting' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
    chooseKind('all');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzzzzzzzz' } });
    await screen.findByText(en.common.noResults);
    expect(getSelectionSnapshot().document).toEqual({ ...emptySelection(), ...saved });
});

it('isolates a shared selection until import, then merges without overwriting', async () => {
    nav.query = `entries=${await encodeSelection({ ...emptySelection(), games: ['b'] })}`;
    setup({ games: ['a'] });
    await screen.findByRole('img', { name: 'Beta' });
    expect(screen.queryByRole('img', { name: 'Alpha' })).not.toBeInTheDocument();
    expect(getSelectionSnapshot().document.games).toEqual(['a']);
    fireEvent.click(screen.getByRole('button', { name: text.import }));
    expect(getSelectionSnapshot().document.games).toEqual(['a', 'b']);
    expect(screen.getByRole('button', { name: text.imported })).toBeDisabled();
});

it('shows an error for a corrupted link and offers no import', async () => {
    nav.query = 'entries=!!!';
    setup({ games: ['a'] });
    expect(await screen.findByText(text.invalid)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: text.import })).not.toBeInTheDocument();
    expect(getSelectionSnapshot().document.games).toEqual(['a']);
});

it('shares the complete selection even while a kind filter is active, with a manual-copy fallback', async () => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    const saved = { games: ['a', 'b'], backlog: ['42'] };
    setup(saved);
    await screen.findByRole('img', { name: 'Alpha' });
    chooseKind('games');
    fireEvent.click(screen.getByRole('button', { name: text.share }));
    const input = await screen.findByRole('textbox', { name: text.shareLink }) as HTMLInputElement;
    const entries = new URL(input.value).searchParams.get('entries')!;
    expect(await decodeSelection(entries)).toEqual({ ...emptySelection(), ...saved });
    fireEvent.click(screen.getByRole('button', { name: text.copy }));
    expect(await screen.findByText(text.copyFallback)).toBeInTheDocument();
});

it('clears only after confirmation', async () => {
    setup({ games: ['a'] });
    await screen.findByRole('img', { name: 'Alpha' });
    fireEvent.click(screen.getByRole('button', { name: text.clear }));
    fireEvent.click(screen.getByRole('button', { name: text.cancel }));
    expect(getSelectionSnapshot().document.games).toEqual(['a']);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: text.clear }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: text.clear }));
    expect(getSelectionSnapshot().document).toEqual(emptySelection());
});