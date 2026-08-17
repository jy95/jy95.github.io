import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const labels: Record<string, string> = {
            voteAction: 'Vote',
            voted: 'Voted!',
            disclaimer: 'Some disclaimer text',
        };
        return labels[key] ?? key;
    },
}));

const getGlobalStatsMock = vi.fn();
const getMyVotesMock = vi.fn();
const toggleMock = vi.fn();

vi.mock('@/redux/services/votesAPI', () => ({
    useGetGlobalStatsQuery: () => getGlobalStatsMock(),
    useGetMyVotesQuery: (...args: unknown[]) => getMyVotesMock(...args),
    useToggleVoteMutation: () => [toggleMock, { isLoading: false }],
}));

const getUserMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signInWithOAuthMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: (...args: unknown[]) => getUserMock(...args),
            onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
            signInWithOAuth: (...args: unknown[]) => signInWithOAuthMock(...args),
        },
    }),
}));

import VoteSection from './VoteSection';

describe('VoteSection', () => {
    beforeEach(() => {
        getGlobalStatsMock.mockReset().mockReturnValue({ data: { 'my-game': 5 } });
        getMyVotesMock.mockReset().mockReturnValue({ data: [] });
        toggleMock.mockReset();
        getUserMock.mockReset().mockResolvedValue({ data: { user: undefined } });
        onAuthStateChangeMock.mockReset().mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
        signInWithOAuthMock.mockReset().mockResolvedValue({});
    });

    it('renders the vote count and "vote" label when logged out', async () => {
        render(<VoteSection slug="my-game" />);
        expect(await screen.findByText('5 • Vote')).toBeInTheDocument();
    });

    it('renders the "voted" label when the user already voted for this slug', async () => {
        getMyVotesMock.mockReturnValue({ data: ['my-game'] });
        render(<VoteSection slug="my-game" />);
        expect(await screen.findByText('5 • Voted!')).toBeInTheDocument();
    });

    it('shows 0 as the count when no stats entry exists for this slug', async () => {
        getGlobalStatsMock.mockReturnValue({ data: {} });
        render(<VoteSection slug="unknown-game" />);
        expect(await screen.findByText('0 • Vote')).toBeInTheDocument();
    });

    it('renders the disclaimer text', async () => {
        render(<VoteSection slug="my-game" />);
        expect(await screen.findByText('Some disclaimer text')).toBeInTheDocument();
    });

    it('triggers OAuth sign-in instead of voting when the user is logged out', async () => {
        render(<VoteSection slug="my-game" />);
        fireEvent.click(await screen.findByText('5 • Vote'));

        await waitFor(() => expect(signInWithOAuthMock).toHaveBeenCalledTimes(1));
        expect(toggleMock).not.toHaveBeenCalled();
        expect(signInWithOAuthMock).toHaveBeenCalledWith(
            expect.objectContaining({ provider: 'google' })
        );
    });

    it('calls the toggle mutation with slug/userId/hasVoted once the user is logged in', async () => {
        getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        render(<VoteSection slug="my-game" />);

        const chip = await screen.findByText('5 • Vote');
        fireEvent.click(chip);

        await waitFor(() =>
            expect(toggleMock).toHaveBeenCalledWith({ slug: 'my-game', userId: 'user-1', hasVoted: false })
        );
        expect(signInWithOAuthMock).not.toHaveBeenCalled();
    });

    it('passes hasVoted: true to the toggle mutation when the user already voted', async () => {
        getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
        getMyVotesMock.mockReturnValue({ data: ['my-game'] });
        render(<VoteSection slug="my-game" />);

        const chip = await screen.findByText('5 • Voted!');
        fireEvent.click(chip);

        await waitFor(() =>
            expect(toggleMock).toHaveBeenCalledWith({ slug: 'my-game', userId: 'user-1', hasVoted: true })
        );
    });

    it('updates userId (and thus behavior) when onAuthStateChange fires', async () => {
        let authCallback: ((event: string, session: unknown) => void) | undefined;
        onAuthStateChangeMock.mockImplementation((cb: (event: string, session: unknown) => void) => {
            authCallback = cb;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });

        render(<VoteSection slug="my-game" />);
        await screen.findByText('5 • Vote');

        authCallback?.('SIGNED_IN', { user: { id: 'user-2' } });

        const chip = await screen.findByText('5 • Vote');
        fireEvent.click(chip);

        await waitFor(() =>
            expect(toggleMock).toHaveBeenCalledWith({ slug: 'my-game', userId: 'user-2', hasVoted: false })
        );
    });

    it('unsubscribes from the auth listener on unmount', async () => {
        const unsubscribe = vi.fn();
        onAuthStateChangeMock.mockReturnValue({ data: { subscription: { unsubscribe } } });

        const { unmount } = render(<VoteSection slug="my-game" />);
        await screen.findByText('5 • Vote');
        unmount();

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('skips fetching personal votes until a userId is known', async () => {
        render(<VoteSection slug="my-game" />);
        await screen.findByText('5 • Vote');

        expect(getMyVotesMock).toHaveBeenCalledWith(undefined, { skip: true });
    });
});
