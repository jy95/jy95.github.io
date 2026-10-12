import { NextIntlClientProvider } from 'next-intl';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StoreProvider from '@/providers/StoreProvider';
import en from '../../../../messages/en.json';
import { CardGrid } from './CardGrid';

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
    window.localStorage.clear();
});

describe('CardGrid with real cards', () => {
    it('shows the details link for every card by default', () => {
        render(<CardGrid items={games} size={{ xs: 12 }} selectable={false} />);
        for (const game of games) {
            expect(screen.getByRole('link', { name: `View details for ${game.title}` })).toHaveAttribute('href', `/en/games/detail/${game.id}`);
        }
    });

    it('hides details for every card when showDetails is false and preserves navigation with both actions disabled', () => {
        render(<CardGrid items={games} size={{ xs: 12 }} selectable={false} showDetails={false} />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /my selection/ })).not.toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(games.length);
        for (const game of games) {
            fireEvent.click(screen.getByRole('button', { name: `${game.title} ${game.title}` }));
            expect(pushMock).toHaveBeenLastCalledWith({
                pathname: game.url_type === 'VIDEO' ? '/video/[id]' : '/playlist/[id]',
                params: { id: game.id },
            });
        }
        expect(pushMock).toHaveBeenCalledTimes(games.length);
    });
});
