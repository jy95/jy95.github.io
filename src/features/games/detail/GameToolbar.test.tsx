import { echoTranslations } from "@/test/mocks/nextIntl";
vi.mock("next-intl", () => echoTranslations());
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

import GameToolbar from './GameToolbar';
import type { CardGame } from '@/domain/games';
import type { BacklogEntry } from '@/app/api/backlog/route';

const baseCard: CardGame = {
    id: 'abc123',
    title: 'Some Game',
    url: 'https://www.youtube.com/watch?v=abc123',
    url_type: 'VIDEO',
    imagePath: '/covers/abc123/cover.webp',
};

const baseBacklog: BacklogEntry = {
    id: '42',
    title: 'A Backlog Entry',
    imagePath: '/backlogcovers/42/cover.webp',
};

describe('GameToolbar', () => {
    beforeEach(() => {
        pushMock.mockReset();
    });

    it('renders the game title', () => {
        render(<GameToolbar game={baseCard} onClose={vi.fn()} />);
        expect(screen.getByText('Some Game')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn();
        render(<GameToolbar game={baseCard} onClose={onClose} />);
        fireEvent.click(screen.getByLabelText('gameDetail.close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hides the watch button when the card game has no availableAt', () => {
        render(<GameToolbar game={baseCard} onClose={vi.fn()} />);
        expect(screen.queryByLabelText('gameDetail.watch')).not.toBeInTheDocument();
    });

    it('hides the watch button when availableAt is in the future', () => {
        const futureGame = { ...baseCard, availableAt: '2099-01-01' };
        render(<GameToolbar game={futureGame} onClose={vi.fn()} />);
        expect(screen.queryByLabelText('gameDetail.watch')).not.toBeInTheDocument();
    });

    it('requires published membership for page watch actions even when availableAt is in the past', () => {
        render(<GameToolbar game={{ ...baseCard, availableAt: '2020-01-01' }} onClose={vi.fn()} presentation="page" />);
        expect(screen.queryByLabelText('gameDetail.watch')).not.toBeInTheDocument();
    });

    it('shows page watch actions for published games without availableAt', () => {
        render(<GameToolbar game={baseCard} onClose={vi.fn()} presentation="page" isPublished />);
        expect(screen.getByLabelText('gameDetail.watch')).toBeInTheDocument();
    });

    it('shows the watch button when availableAt is in the past', () => {
        const pastGame = { ...baseCard, availableAt: '2020-01-01' };
        render(<GameToolbar game={pastGame} onClose={vi.fn()} />);
        expect(screen.getByLabelText('gameDetail.watch')).toBeInTheDocument();
    });

    it('never shows the watch button for a backlog entry, even without url_type', () => {
        render(<GameToolbar game={{ ...baseBacklog }} onClose={vi.fn()} />);
        expect(screen.queryByLabelText('gameDetail.watch')).not.toBeInTheDocument();
    });

    it('pushes to the playlist route when watching a PLAYLIST-type game', () => {
        const playlistGame: CardGame = {
            ...baseCard,
            id: 'PL123',
            url_type: 'PLAYLIST',
            availableAt: '2020-01-01',
        };
        render(<GameToolbar game={playlistGame} onClose={vi.fn()} />);
        fireEvent.click(screen.getByLabelText('gameDetail.watch'));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/playlist/[id]',
            params: { id: 'PL123' },
        });
    });

    it('pushes to the video route when watching a VIDEO-type game', () => {
        const videoGame: CardGame = { ...baseCard, availableAt: '2020-01-01' };
        render(<GameToolbar game={videoGame} onClose={vi.fn()} />);
        fireEvent.click(screen.getByLabelText('gameDetail.watch'));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/video/[id]',
            params: { id: 'abc123' },
        });
    });
});
