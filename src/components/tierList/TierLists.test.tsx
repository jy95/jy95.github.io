import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Keep the API hook mocked so tests control the categories state
const useGetSortedCategoriesQueryMock = vi.fn();
vi.mock('@/redux/services/tierListAPI', () => ({
    useGetSortedCategoriesQuery: (...args: unknown[]) => useGetSortedCategoriesQueryMock(...args),
}));

// Mock next-intl so components using useTranslations render stable strings in tests.
// The real code calls useTranslations(namespace) and then t(key[, opts]).
// Our mock returns a t function that maps some keys to friendly test strings
vi.mock('next-intl', () => ({
    useTranslations: (ns?: string) => (key: string, opts?: any) => {
        const fullKey = ns ? `${ns}.${key}` : key;
        if (fullKey.endsWith('retry')) return 'Retry';
        if (fullKey.endsWith('generic')) return 'Something went wrong';
        if (fullKey.endsWith('empty')) return 'No games';
        if (fullKey.endsWith('distributionTitle')) return 'Distribution';
        if (fullKey.endsWith('total_games')) return `${opts?.count ?? 0} games`;
        if (fullKey.endsWith('title')) return 'Disclaimer';
        // default: return the raw key (good for category keys like 'tier_good')
        return key;
    },
}));

// Keep the controls mocked because the real controls render an icon-only MUI Button
// (no accessible text) — mocking preserves a test-friendly toggle button with a testid.
vi.mock('./TierListControls', () => ({
    TierListControls: ({ onToggleSort }: { onToggleSort: () => void }) => (
        <button data-testid="toggle-sort" onClick={onToggleSort}>
            Toggle
        </button>
    ),
}));

// Use the real QueryErrorState, TierListBoard, DistributionBar and DisclaimerAccordion
// (we removed the mocks for them so the tests exercise more of the real UI).

import { TierLists } from './TierLists';
import type { RawType } from './index';

const GameRender = ({ game }: { game: RawType }) => <div>{game.id}</div>;

describe('TierLists', () => {
    beforeEach(() => {
        useGetSortedCategoriesQueryMock.mockReset();
    });

    it('shows a loading spinner while categories are loading', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: undefined,
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows a loading spinner while the parent-supplied data is loading, even once categories resolved', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: ['tier_good'],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} isLoadingData />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders QueryErrorState when the categories query fails', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('boom'),
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} />);
        // QueryErrorState renders a retry button labeled "Retry" (from our next-intl mock)
        expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('forwards refetch to QueryErrorState as onRetry', () => {
        const refetch = vi.fn();
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('boom'),
            refetch,
        });
        render(<TierLists GameRender={GameRender} />);
        fireEvent.click(screen.getByText('Retry'));
        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('renders nothing when categories resolve to an empty array', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: [],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        const { container } = render(<TierLists GameRender={GameRender} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when categories is undefined and not flagged as loading', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        const { container } = render(<TierLists GameRender={GameRender} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders controls, distribution bar, disclaimer and board once categories resolve', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: ['tier_good', 'tier_bad'],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });

        // Provide one game in tier_good so DistributionBar shows up (it hides when totalGames === 0)
        const data = { tier_good: [{ id: 'g1' }] };

        render(<TierLists GameRender={GameRender} data={data} />);

        // Controls (mocked) are present
        expect(screen.getByTestId('toggle-sort')).toBeInTheDocument();

        // DistributionHeader is shown (our next-intl mock provides "Distribution")
        expect(screen.getByText('Distribution')).toBeInTheDocument();

        // DisclaimerAccordion summary includes the title text (our next-intl mock provides "Disclaimer")
        expect(screen.getByText('Disclaimer')).toBeInTheDocument();

        // Board: Tier titles for both categories should be rendered (we return raw keys like 'tier_good')
        expect(screen.getByText('tier_good')).toBeInTheDocument();
        expect(screen.getByText('tier_bad')).toBeInTheDocument();

        // For the empty category (tier_bad) the GamesRow should display the "empty" text
        expect(screen.getByText('No games')).toBeInTheDocument();
    });

    it('defaults sortOrder to "asc" on the initial query call', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: ['tier_good'],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} />);
        expect(useGetSortedCategoriesQueryMock).toHaveBeenCalledWith('asc');
    });

    it('toggles sortOrder from asc to desc when the controls are used', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: ['tier_good'],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} />);
        fireEvent.click(screen.getByTestId('toggle-sort'));
        expect(useGetSortedCategoriesQueryMock).toHaveBeenLastCalledWith('desc');
    });

    it('toggles back to asc on a second click', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: ['tier_good'],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} />);
        fireEvent.click(screen.getByTestId('toggle-sort'));
        fireEvent.click(screen.getByTestId('toggle-sort'));
        expect(useGetSortedCategoriesQueryMock).toHaveBeenLastCalledWith('asc');
    });

    it('passes the parent-supplied data through to the board via categories', () => {
        useGetSortedCategoriesQueryMock.mockReturnValue({
            data: ['tier_masterpiece'],
            isLoading: false,
            error: undefined,
            refetch: vi.fn(),
        });
        render(<TierLists GameRender={GameRender} data={{ tier_masterpiece: [{ id: '1' }] }} />);
        // TierTitle uses the translation function; our mock returns the raw key for category names
        expect(screen.getByText('tier_masterpiece')).toBeInTheDocument();
    });
});
