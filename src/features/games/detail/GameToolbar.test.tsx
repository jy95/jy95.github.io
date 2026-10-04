import StoreProvider from '@/providers/StoreProvider';
import { echoTranslations } from "@/test/mocks/nextIntl";
vi.mock("next-intl", () => echoTranslations());
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

import GameToolbar from './GameToolbar';
import type { CardGame } from '@/domain/games';
import type { BacklogEntry } from '@/app/api/backlog/route';
import { emptySelection } from '@/domain/selection/operations';
import { SELECTION_STORAGE_KEY, getSelectionSnapshot } from '@/features/selection/storage/store';

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
    afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });
    beforeEach(() => {
        pushMock.mockReset();
        localStorage.clear();
    });

    it('hides the selection button when selection is disabled', () => {
        const write = vi.spyOn(Storage.prototype, 'setItem');
        render(<GameToolbar game={baseCard} onClose={vi.fn()} selectable={false} />);
        expect(screen.queryByRole('button', { name: 'selection.add:{"title":"Some Game"}' })).not.toBeInTheDocument();
        expect(screen.queryByTestId('BookmarkBorderIcon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('BookmarkIcon')).not.toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('gameDetail.close'));
        expect(write).not.toHaveBeenCalled();
    });

    it.each([
        ['games', baseCard, undefined],
        ['backlog', baseBacklog, undefined],
        ['planning', { ...baseCard, status: 'PENDING' as const }, undefined],
        ['dlcs', baseCard, 'dlcs'],
    ] as const)('selects the %s category without changing other categories', (expected, game, category) => {
        const personal = { ...emptySelection(), games: ['saved'], backlog: ['saved'] };
        localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(personal));
        render(<GameToolbar game={game} category={category} onClose={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: `selection.add:${JSON.stringify({ title: game.title })}` }));
        expect(getSelectionSnapshot().document).toEqual({ ...personal, [expected]: [...personal[expected], game.id] });
    });

    it('uses the page back callback without navigating to watch', () => {
        const onClose = vi.fn();
        render(<GameToolbar game={baseCard} onClose={onClose} presentation="page" isPublished />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(baseCard.title);
        fireEvent.click(screen.getByLabelText('gameDetail.back'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('hides watch actions for invalid availability dates', () => {
        render(<GameToolbar game={{ ...baseCard, availableAt: 'invalid' }} onClose={vi.fn()} />);
        expect(screen.queryByLabelText('gameDetail.watch')).not.toBeInTheDocument();
    });

    it('allows published dialog watch actions even when availableAt is in the future', () => {
        render(<GameToolbar game={{ ...baseCard, availableAt: '2099-01-01' }} onClose={vi.fn()} isPublished selectable={false} />);
        fireEvent.click(screen.getByLabelText('gameDetail.watch'));
        expect(pushMock).toHaveBeenCalledWith({ pathname: '/video/[id]', params: { id: baseCard.id } });
        expect(screen.queryByTestId('BookmarkBorderIcon')).not.toBeInTheDocument();
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

function render(ui: React.ReactNode) { return rtlRender(<StoreProvider>{ui}</StoreProvider>); }
