import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

const push = vi.fn();
vi.mock('@/redux/services/platformsAPI', () => ({
    useGetPlatformsQuery: () => ({ data: [{ id: 1, name: 'PC' }, { id: 2, name: 'GBA' }] }),
}));

// 1. Bloquer le chargement interne ESM de next/navigation dans next-intl
vi.mock('next-intl/navigation', () => ({
    defineRouting: (config: unknown) => config,
    createNavigation: () => ({
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
        redirect: vi.fn(),
        usePathname: () => '',
        useRouter: () => ({ push, replace: vi.fn() }),
        getPathname: vi.fn(),
    }),
}));

// 2. Moquer le routing de l'application
vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    redirect: vi.fn(),
    usePathname: () => '',
    useRouter: () => ({ push, replace: vi.fn() }),
    getPathname: vi.fn(),
}));

vi.mock('next-intl', () => echoTranslations());

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: async () => ({ data: { user: undefined } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
            signInWithOAuth: vi.fn(),
        },
    }),
}));

vi.mock('@/redux/services/votesAPI', () => ({
    useGetGlobalStatsQuery: () => ({ data: {} }),
    useGetMyVotesQuery: () => ({ data: [] }),
    useToggleVoteMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/features/games/components/RelatedGames', () => ({
    default: ({ gameId }: { gameId: string }) => <div data-testid="related-games">related-games:{gameId}</div>,
}));

import GameDetailView from './GameDetailView';
import GameDetailContent from './GameDetailContent';
import type { CardGame } from '@/domain/games';

const game: CardGame = {
    id: 'abc123',
    title: 'Some Game',
    genres: [1, 2],
    url: 'https://example.com',
    url_type: 'VIDEO',
    imagePath: '/covers/abc123/cover.webp',
};

describe.each(['page content', 'dialog'])('filter chips in %s', (context) => {
    it.each([
        ['gamesLibrary.gamesGenres.2', { genres: '2' }, 'Enter', 1],
        ['gamesLibrary.gamesGenres.2', { genres: '2' }, ' ', 1],
        ['PC', { platform: '1' }, 'Enter', 1],
        ['PC', { platform: '1' }, ' ', 1],
        ['GBA', { platform: '2' }, 'Enter', 2],
        ['GBA', { platform: '2' }, ' ', 2],
    ])('navigates from %s using keyboard and pointer', (name, query, key, platformId) => {
        const entry = { ...game, platform: platformId };
        render(context === 'dialog'
            ? <GameDetailView game={entry} onClose={vi.fn()} showVoteSection={false} />
            : <GameDetailContent game={entry} showVoteSection={false} />);
        expect(screen.getByText('gameDetail.genres:{"count":2}')).toBeInTheDocument();
        expect(screen.getByTestId('LabelIcon')).toHaveClass('MuiSvgIcon-fontSizeSmall');
        const platformLabel = screen.getByText('gameDetail.platforms:{"count":1}');
        const platformName = platformId === 1 ? 'PC' : 'GBA';
        const platformChip = screen.getByRole('button', { name: platformName });
        const platformFieldIcon = platformLabel.parentElement?.querySelector('svg');
        expect(platformFieldIcon).toBe(screen.getByTestId('GamepadIcon'));
        expect(platformFieldIcon).toHaveClass('MuiSvgIcon-fontSizeSmall');
        expect(platformChip.querySelector('svg')).toHaveClass('MuiSvgIcon-root');
        expect(platformChip.querySelectorAll('svg')).toHaveLength(1);
        expect(platformChip).toHaveAttribute('aria-label', platformName);
        expect(platformChip).toHaveTextContent(/^$/);
        expect(screen.queryByText(platformName)).not.toBeInTheDocument();
        expect(platformChip).not.toContainElement(platformFieldIcon ?? null);
        const chip = screen.getByRole('button', { name });
        expect(chip).toHaveAttribute('tabindex', '0');
        expect(chip).toHaveClass('MuiChip-clickable', 'MuiChip-outlined', 'MuiChip-sizeSmall');
        push.mockClear();
        fireEvent.keyDown(chip, { key });
        fireEvent.keyUp(chip, { key });
        expect(push).toHaveBeenCalledExactlyOnceWith({ pathname: '/games', query });
        push.mockClear();
        fireEvent.click(chip);
        expect(push).toHaveBeenCalledExactlyOnceWith({ pathname: '/games', query });
    });

    it('omits labels and field icons for empty genres and an unmatched platform', () => {
        const entry = { ...game, genres: [], platform: 99 };
        render(context === 'dialog'
            ? <GameDetailView game={entry} onClose={vi.fn()} showVoteSection={false} />
            : <GameDetailContent game={entry} showVoteSection={false} />);
        expect(screen.queryByText(/^gameDetail.genres:/)).not.toBeInTheDocument();
        expect(screen.queryByTestId('LabelIcon')).not.toBeInTheDocument();
        expect(screen.queryByText(/^gameDetail.platforms:/)).not.toBeInTheDocument();
        expect(screen.queryByTestId('GamepadIcon')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'PC' })).not.toBeInTheDocument();
    });
});

describe('GameDetailView', () => {
    it('renders the game title in the toolbar', () => {
        render(<GameDetailView game={game} onClose={vi.fn()} />);
        expect(screen.getByText('Some Game')).toBeInTheDocument();
    });

    it('shows the vote section by default', () => {
        render(<GameDetailView game={game} onClose={vi.fn()} />);
        // Cibler explicitement le disclaimer de vote
        expect(screen.getByText('vote.disclaimer')).toBeInTheDocument();
    });

    it('hides the vote section when showVoteSection is false', () => {
        render(<GameDetailView game={game} onClose={vi.fn()} showVoteSection={false} />);
        expect(screen.queryByText('vote.disclaimer')).not.toBeInTheDocument();
    });

    it('does not show related games by default', () => {
        render(<GameDetailView game={game} onClose={vi.fn()} />);
        expect(screen.queryByText('related-games:abc123')).not.toBeInTheDocument();
    });

    it('shows related games for the selected game when enabled', () => {
        render(<GameDetailView game={game} onClose={vi.fn()} showRelatedGames />);
        expect(screen.getByText('related-games:abc123')).toBeInTheDocument();
    });

    it('renders related games as a sibling of the top two-column layout', () => {
        render(<GameDetailView game={game} onClose={vi.fn()} showRelatedGames />);
        const relatedGames = screen.getByTestId('related-games');
        const topLayout = relatedGames.previousElementSibling;

        expect(topLayout).toHaveClass('MuiStack-root');
        expect(topLayout).not.toContainElement(relatedGames);
        expect(topLayout?.parentElement).toBe(relatedGames.parentElement);
    });

    it('renders developers, publishers, then the release date alongside the existing game details', () => {
        render(<GameDetailView game={{
            ...game,
            developers: [{ id: 73, name: 'Ubisoft Reflections' }],
            publishers: [{ id: 12, name: 'Ubisoft' }],
            releaseDate: '2020-01-01',
        }} onClose={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Ubisoft Reflections' })).toHaveClass('MuiChip-root');
        expect(screen.getByRole('button', { name: 'Ubisoft' })).toHaveClass('MuiChip-root');
        expect(screen.getByText('Some Game')).toBeInTheDocument();
        expect(screen.getByText('vote.disclaimer')).toBeInTheDocument();
        expect(screen.getByText('gamesLibrary.gamesGenres.1')).toBeInTheDocument();
        const developers = screen.getByText('gameDetail.developers:{"count":1}');
        const publishers = screen.getByText('gameDetail.publishers:{"count":1}');
        const releaseDate = screen.getByText('gameDetail.releaseDate');
        expect(developers.compareDocumentPosition(publishers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(publishers.compareDocumentPosition(releaseDate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('renders backlog durations through the same shared content', () => {
        render(<GameDetailView game={{ id: '42', title: 'Backlog game', imagePath: '/backlogcovers/42/cover.webp', hltb_main: '10:00:00' }} onClose={vi.fn()} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Backlog game')).toBeInTheDocument();
        expect(screen.getByText('gameDetail.hltb_main')).toBeInTheDocument();
        expect(screen.getByText('vote.disclaimer')).toBeInTheDocument();
        expect(screen.queryByLabelText('gameDetail.watch')).not.toBeInTheDocument();
    });

    it('retains Escape close handling', () => {
        const onClose = vi.fn();
        render(<GameDetailView game={game} onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when the toolbar close button is clicked', () => {
        const onClose = vi.fn();
        render(<GameDetailView game={game} onClose={onClose} />);
        fireEvent.click(screen.getByLabelText('gameDetail.close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
