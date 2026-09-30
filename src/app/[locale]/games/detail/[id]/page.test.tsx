import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubRtkFetch, calledUrl } from '@/test/mocks/rtkFetch';
import en from '../../../../../../messages/en.json';
import fr from '../../../../../../messages/fr.json';
import type { CardGame } from '@/domain/games';
import type { BacklogEntry, GameDetailsResponse, PlanningEntry } from '@/domain/games/details';

const { back, replace, push, notFound } = vi.hoisted(() => ({
    back: vi.fn(), replace: vi.fn(), push: vi.fn(), notFound: vi.fn(),
}));
vi.mock('next/navigation', () => ({ notFound }));
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ back, replace, push }) }));
vi.mock('next/image', () => ({ default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
vi.mock('@/features/games/detail/VoteSection', () => ({ default: ({ slug }: { slug: string }) => <div>Vote:{slug}</div> }));
vi.mock('@/features/games/components/RelatedGames', () => ({ default: ({ gameId }: { gameId: string }) => <div>Related:{gameId}</div> }));

const fetchMock = stubRtkFetch();
const { api } = await import('@/redux/services/api');
const { default: GameDetailPage } = await import('./page');
const game: CardGame = {
    id: 'PL123', title: 'Published game', imagePath: '/covers/PL123/cover.webp',
    url: 'https://www.youtube.com/playlist?list=PL123', url_type: 'PLAYLIST',
    genres: [1], releaseDate: '2019-01-01',
};
const planned: PlanningEntry = { ...game, id: 'upcoming', title: 'Planned game', availableAt: '2099-01-01', status: 'PENDING' };
const backlog: BacklogEntry = { id: '42', title: 'Backlog game', imagePath: '/backlogcovers/42/cover.webp', notes: 'My notes', hltb_main: '10:00:00' };
let store: ReturnType<typeof makeStore>;
let failedStatus: number | undefined;
function makeStore() {
    return configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (getDefault) => getDefault().concat(api.middleware) });
}
function respond(request: Request) {
    const id = decodeURIComponent(new URL(request.url).pathname.slice('/api/games/'.length));
    if (failedStatus) return new Response('{}', { status: failedStatus });
    const data: GameDetailsResponse | undefined = id === game.id ? { source: 'published', game }
        : id === planned.id ? { source: 'planning', game: planned }
        : id === backlog.id ? { source: 'backlog', game: backlog } : undefined;
    if (!data) return new Response('{}', { status: 404 });
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
async function show(id: string, locale: 'en' | 'fr' = 'en') {
    const params = Promise.resolve({ id });
    await act(async () => {
        render(<Provider store={store}><NextIntlClientProvider locale={locale} messages={locale === 'fr' ? fr : en} timeZone="UTC">
            <GameDetailPage params={params} />
        </NextIntlClientProvider></Provider>);
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    failedStatus = undefined;
    fetchMock.mockImplementation(respond);
    store = makeStore();
});
afterEach(() => { cleanup(); store.dispatch(api.util.resetApiState()); vi.restoreAllMocks(); });

describe('canonical game detail page', () => {
    it.each(['en', 'fr'] as const)('loads a published string ID directly with translated actions in %s', async (locale) => {
        await show(game.id, locale);
        expect(await screen.findByRole('heading', { name: game.title, level: 1 })).toBeInTheDocument();
        expect(screen.getByAltText(game.title)).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText(`Related:${game.id}`)).toBeInTheDocument();
        expect(screen.queryByText(`Vote:${game.id}`)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: locale === 'fr' ? 'Voir le jeu' : 'Watch the game' }));
        expect(push).toHaveBeenCalledWith({ pathname: '/playlist/[id]', params: { id: game.id } });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(calledUrl(fetchMock).pathname).toBe(`/api/games/${game.id}`);
        expect(calledUrl(fetchMock).search).toBe('');
    });

    it('resolves planning entries with one request and preserves related games', async () => {
        await show(planned.id);
        expect(await screen.findByRole('heading', { name: planned.title })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Watch the game' })).not.toBeInTheDocument();
        expect(screen.getByText(`Related:${planned.id}`)).toBeInTheDocument();
        expect(screen.queryByText(`Vote:${planned.id}`)).not.toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(calledUrl(fetchMock).pathname).toBe(`/api/games/${planned.id}`);
    });

    it('does not offer watch for a planning source even when its date is in the past', async () => {
        fetchMock.mockImplementation(() => new Response(JSON.stringify({ source: 'planning', game: { ...planned, availableAt: '2020-01-01' } })));
        await show(planned.id);
        expect(await screen.findByRole('heading', { name: planned.title })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Watch the game' })).not.toBeInTheDocument();
    });

    it('resolves numeric-string backlog IDs and renders their durations and vote section', async () => {
        await show(backlog.id);
        expect(await screen.findByRole('heading', { name: backlog.title })).toBeInTheDocument();
        expect(screen.getByText('10 hours')).toBeInTheDocument();
        expect(screen.getByText(`Vote:${backlog.id}`)).toBeInTheDocument();
        expect(screen.queryByText(`Related:${backlog.id}`)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Watch the game' })).not.toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(calledUrl(fetchMock).pathname).toBe(`/api/games/${backlog.id}`);
    });

    it('encodes string IDs in the single detail request', async () => {
        const id = 'video/with ?query#fragment%';
        fetchMock.mockImplementation(() => new Response(JSON.stringify({ source: 'published', game: { ...game, id } })));
        await show(id);
        expect(await screen.findByRole('heading', { name: game.title })).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(calledUrl(fetchMock).pathname).toBe(`/api/games/${encodeURIComponent(id)}`);
        expect(calledUrl(fetchMock).search).toBe('');
    });

    it('renders loading while a query is pending', async () => {
        fetchMock.mockImplementation(() => new Promise(() => {}));
        await show(game.id);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(notFound).not.toHaveBeenCalled();
    });

    it('uses the existing not-found boundary for HTTP 404', async () => {
        await show('unknown');
        await waitFor(() => expect(notFound).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: en.common.errors.retry })).not.toBeInTheDocument();
    });

    it.each([400, 403, 500, 503])('shows a retryable error for HTTP %s instead of treating a failure as a missing game', async (status) => {
        failedStatus = status;
        await show(backlog.id);
        const retry = await screen.findByRole('button', { name: en.common.errors.retry });
        expect(notFound).not.toHaveBeenCalled();
        failedStatus = undefined;
        fireEvent.click(retry);
        expect(await screen.findByRole('heading', { name: backlog.title })).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(calledUrl(fetchMock, 1).pathname).toBe(`/api/games/${backlog.id}`);
    });

    it('allows retrying a network failure rather than showing not found', async () => {
        fetchMock.mockRejectedValue(new TypeError('Network unavailable'));
        await show(game.id);
        const retry = await screen.findByRole('button', { name: en.common.errors.retry });
        expect(notFound).not.toHaveBeenCalled();
        fetchMock.mockImplementation(respond);
        fireEvent.click(retry);
        expect(await screen.findByRole('heading', { name: game.title })).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('goes back using the existing router when browser history exists', async () => {
        vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
        await show(game.id);
        fireEvent.click(await screen.findByRole('button', { name: 'Back' }));
        expect(back).toHaveBeenCalledOnce();
        expect(replace).not.toHaveBeenCalled();
    });

    it('returns a direct visitor without history to the games catalogue', async () => {
        vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
        await show(game.id, 'fr');
        fireEvent.click(await screen.findByRole('button', { name: 'Retour' }));
        expect(replace).toHaveBeenCalledWith('/games');
        expect(back).not.toHaveBeenCalled();
    });
});
