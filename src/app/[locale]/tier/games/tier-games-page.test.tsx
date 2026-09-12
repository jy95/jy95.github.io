import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetGamesTierListQueryMock = vi.fn();

vi.mock('@/redux/services/tierListAPI', () => ({
    useGetGamesTierListQuery: () => useGetGamesTierListQueryMock(),
}));

vi.mock('@/components/tierList', () => ({
    TierLists: (props: { data?: Record<string, unknown[]>; isLoadingData?: boolean }) => (
        <div data-testid="tier-lists" data-loading={String(props.isLoadingData)}>
            {props.data ? Object.keys(props.data).join(',') : 'no-data'}
        </div>
    ),
}));

vi.mock('@/features/games/components/CardEntry', () => ({
    default: () => <div>card</div>,
}));

import GamesTierList from './page';

describe('GamesTierList (tier/games page)', () => {
    it('forwards the loading state to TierLists', () => {
        useGetGamesTierListQueryMock.mockReturnValue({ data: undefined, isLoading: true });
        render(<GamesTierList />);
        expect(screen.getByTestId('tier-lists')).toHaveAttribute('data-loading', 'true');
    });

    it('forwards fetched tier data to TierLists', () => {
        useGetGamesTierListQueryMock.mockReturnValue({
            data: { tier_good: [], tier_masterpiece: [] },
            isLoading: false,
        });
        render(<GamesTierList />);
        const el = screen.getByTestId('tier-lists');
        expect(el).toHaveTextContent('tier_good,tier_masterpiece');
        expect(el).toHaveAttribute('data-loading', 'false');
    });

    it('renders nothing when the query has neither data nor a loading state', () => {
        useGetGamesTierListQueryMock.mockReturnValue({ data: undefined, isLoading: false });
        render(<GamesTierList />);
        expect(screen.queryByTestId('tier-lists')).not.toBeInTheDocument();
    });
});
