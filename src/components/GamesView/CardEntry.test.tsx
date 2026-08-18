import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={props.alt as string} src={props.src as string} />
    ),
}));

import CardEntry from './CardEntry';
import type { CardGame } from '@/redux/sharedDefintion';

const baseGame: CardGame = {
    id: 'abc123',
    title: 'Some Game',
    url: 'https://www.youtube.com/watch?v=abc123',
    url_type: 'VIDEO',
    imagePath: '/covers/abc123/cover.webp',
};

describe('CardEntry', () => {
    beforeEach(() => {
        pushMock.mockReset();
    });

    it('renders the game title via the overlay', () => {
        render(<CardEntry game={baseGame} />);
        expect(screen.getByText('Some Game')).toBeInTheDocument();
    });

    it('pushes to the video route when the game is a VIDEO', () => {
        render(<CardEntry game={baseGame} />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/video/[id]',
            params: { id: 'abc123' },
        });
    });

    it('pushes to the playlist route when the game is a PLAYLIST', () => {
        const playlistGame: CardGame = { ...baseGame, id: 'PL123', url_type: 'PLAYLIST' };
        render(<CardEntry game={playlistGame} />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/playlist/[id]',
            params: { id: 'PL123' },
        });
    });

    it('calls push exactly once per click', () => {
        render(<CardEntry game={baseGame} />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

    it('uses the game id (not the url) as the route param', () => {
        const otherGame: CardGame = { ...baseGame, id: 'different-id' };
        render(<CardEntry game={otherGame} />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledWith(
            expect.objectContaining({ params: { id: 'different-id' } })
        );
    });
});
