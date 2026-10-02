import { NextIntlClientProvider } from 'next-intl';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';
import type { ComponentProps } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
    Link: ({ href, locale, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: { params: { id: string } }; locale: string }) =>
        <a {...props} href={`/${locale}/games/detail/${href.params.id}`} />,
}));

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={props.alt as string} src={props.src as string} />
    ),
}));

import CardEntry from './CardEntry';
import StoreProvider from '@/providers/StoreProvider';
import type { CardGame } from '@/domain/games';

const baseGame: CardGame = {
    id: 'abc123',
    title: 'Some Game',
    url: 'https://www.youtube.com/watch?v=abc123',
    url_type: 'VIDEO',
    imagePath: '/covers/abc123/cover.webp',
};

function render(ui: React.ReactNode, locale: 'en' | 'fr' = 'en') {
    return rtlRender(<StoreProvider><NextIntlClientProvider locale={locale} messages={locale === 'fr' ? fr : en}>{ui}</NextIntlClientProvider></StoreProvider>);
}

describe('CardEntry', () => {
    beforeEach(() => {
        pushMock.mockReset();
    });

    it.each(['en', 'fr'] as const)('offers an accessible detail link in %s without activating the main card', (locale) => {
        const parentClick = vi.fn();
        render(<div onClick={parentClick}><CardEntry game={baseGame} /></div>, locale);
        const label = locale === 'fr' ? 'Voir les détails de Some Game' : 'View details for Some Game';
        const link = screen.getByRole('link', { name: label });
        expect(link).toHaveAttribute('href', `/${locale}/games/detail/abc123`);
        expect(screen.getByRole('button', { name: 'Some Game Some Game' })).not.toContainElement(link);
        fireEvent.click(link);
        expect(pushMock).not.toHaveBeenCalled();
        expect(parentClick).not.toHaveBeenCalled();
    });

    it('renders the game title via the overlay', () => {
        render(<CardEntry game={baseGame} />);
        expect(screen.getByText('Some Game')).toBeInTheDocument();
    });

    it('pushes to the video route when the game is a VIDEO', () => {
        render(<CardEntry game={baseGame} />);
        fireEvent.click(screen.getByRole('button', { name: 'Some Game Some Game' }));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/video/[id]',
            params: { id: 'abc123' },
        });
    });

    it('pushes to the playlist route when the game is a PLAYLIST', () => {
        const playlistGame: CardGame = { ...baseGame, id: 'PL123', url_type: 'PLAYLIST' };
        render(<CardEntry game={playlistGame} />);
        fireEvent.click(screen.getByRole('button', { name: 'Some Game Some Game' }));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/playlist/[id]',
            params: { id: 'PL123' },
        });
    });

    it('calls push exactly once per click', () => {
        render(<CardEntry game={baseGame} />);
        fireEvent.click(screen.getByRole('button', { name: 'Some Game Some Game' }));
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

    it('uses the game id (not the url) as the route param', () => {
        const otherGame: CardGame = { ...baseGame, id: 'different-id' };
        render(<CardEntry game={otherGame} />);
        fireEvent.click(screen.getByRole('button', { name: 'Some Game Some Game' }));
        expect(pushMock).toHaveBeenCalledWith(
            expect.objectContaining({ params: { id: 'different-id' } })
        );
    });
});

it('does not offer game selection for review cards', () => {
    render(<CardEntry game={baseGame} selectable={false} />);
    expect(screen.queryByRole('button', { name: /my selection/ })).not.toBeInTheDocument();
});

it('does not show selection kind badges on ordinary cards', () => {
    render(<CardEntry game={baseGame} />);
    expect(screen.queryByTestId('SportsEsportsIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ExtensionIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ScheduleIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('HourglassEmptyIcon')).not.toBeInTheDocument();
});
