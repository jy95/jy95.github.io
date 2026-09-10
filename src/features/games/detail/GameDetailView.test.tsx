import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// 1. Bloquer le chargement interne ESM de next/navigation dans next-intl
vi.mock('next-intl/navigation', () => ({
    defineRouting: (config: unknown) => config,
    createNavigation: () => ({
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
        redirect: vi.fn(),
        usePathname: () => '',
        useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
        getPathname: vi.fn(),
    }),
}));

// 2. Moquer le routing de l'application
vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    redirect: vi.fn(),
    usePathname: () => '',
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    getPathname: vi.fn(),
}));

vi.mock('next-intl', () => ({
    useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

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

import GameDetailView from './GameDetailView';
import type { CardGame } from '@/domain/games';

const game: CardGame = {
    id: 'abc123',
    title: 'Some Game',
    genres: [1, 2],
    url: 'https://example.com',
    url_type: 'VIDEO',
    imagePath: '/covers/abc123/cover.webp',
};

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

    it('calls onClose when the toolbar close button is clicked', () => {
        const onClose = vi.fn();
        render(<GameDetailView game={game} onClose={onClose} />);
        fireEvent.click(screen.getByLabelText('close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});