import { NextIntlClientProvider } from 'next-intl';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StoreProvider from '@/providers/StoreProvider';
import en from '../../../../messages/en.json';
import TestsPage from './page';

import type { ComponentProps, ReactNode } from 'react';
import type { CardGame } from '@/domain/games';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
    Link: ({ href, locale, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: { params: { id: string } }; locale: string }) =>
        <a {...props} href={`/${locale}/games/detail/${href.params.id}`} />,
}));

vi.mock('next/image', () => ({
    default: ({ alt, src }: { alt: string; src: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} src={src} />
    ),
}));

const games: CardGame[] = [
    { id: 'review-video', title: 'Video review', url: 'https://www.youtube.com/watch?v=review-video', url_type: 'VIDEO', imagePath: '/covers/review-video/cover.webp' },
    { id: 'review-playlist', title: 'Playlist review', url: 'https://www.youtube.com/playlist?list=review-playlist', url_type: 'PLAYLIST', imagePath: '/covers/review-playlist/cover.webp' },
];

function render(ui: ReactNode) {
    return rtlRender(<StoreProvider><NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider></StoreProvider>);
}

beforeEach(() => {
    pushMock.mockReset();
    useGetTestsQueryMock.mockReset();
    window.localStorage.clear();
});

const useGetTestsQueryMock = vi.fn();
vi.mock('@/redux/services/testsAPI', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/redux/services/testsAPI')>(),
    useGetTestsQuery: (...args: unknown[]) => useGetTestsQueryMock(...args),
}));

describe('TestsPage', () => {
    it('renders fetched cards through CardGrid without actions and preserves watch navigation', () => {
        useGetTestsQueryMock.mockReturnValue({ data: { items: games }, error: undefined, isLoading: false, refetch: vi.fn() });
        render(<TestsPage />);
        expect(useGetTestsQueryMock).toHaveBeenCalledWith({});
        expect(screen.getAllByRole('button')).toHaveLength(games.length);
        for (const game of games) {
            expect(screen.getByText(game.title)).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: `View details for ${game.title}` })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: `Add ${game.title} to my selection` })).not.toBeInTheDocument();
            fireEvent.click(screen.getByRole('button', { name: `${game.title} ${game.title}` }));
            expect(pushMock).toHaveBeenLastCalledWith({
                pathname: game.url_type === 'VIDEO' ? '/video/[id]' : '/playlist/[id]',
                params: { id: game.id },
            });
        }
        expect(pushMock).toHaveBeenCalledTimes(games.length);
    });
});
