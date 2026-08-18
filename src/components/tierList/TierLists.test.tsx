import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const useGetSortedCategoriesQueryMock = vi.fn();
vi.mock('@/redux/services/tierListAPI', () => ({
    useGetSortedCategoriesQuery: (...args: unknown[]) => useGetSortedCategoriesQueryMock(...args),
}));

vi.mock('@/components/common/QueryErrorState', () => ({
    default: ({ onRetry }: { onRetry?: () => void }) => (
        <div data-testid="query-error">
            <button onClick={onRetry}>Retry</button>
        </div>
    ),
}));

vi.mock('./TierListControls', () => ({
    TierListControls: ({ onToggleSort }: { onToggleSort: () => void }) => (
        <button data-testid="toggle-sort" onClick={onToggleSort}>
            Toggle
        </button>
    ),
}));

vi.mock('./TierListBoard', () => ({
    TierListBoard: ({ categories }: { categories: string[] }) => (
        <div data-testid="tier-list-board">{categories.join(',')}</div>
    ),
}));

vi.mock('./DistributionBar', () => ({
    default: () => <div data-testid="distribution-bar" />,
}));

vi.mock('./DisclaimerAccordion', () => ({
    default: () => <div data-testid="disclaimer-accordion" />,
}));

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
        expect(screen.getByTestId('query-error')).toBeInTheDocument();
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
        render(<TierLists GameRender={GameRender} />);
        expect(screen.getByTestId('toggle-sort')).toBeInTheDocument();
        expect(screen.getByTestId('distribution-bar')).toBeInTheDocument();
        expect(screen.getByTestId('disclaimer-accordion')).toBeInTheDocument();
        expect(screen.getByTestId('tier-list-board')).toHaveTextContent('tier_good,tier_bad');
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
        expect(screen.getByTestId('tier-list-board')).toHaveTextContent('tier_masterpiece');
    });
});
