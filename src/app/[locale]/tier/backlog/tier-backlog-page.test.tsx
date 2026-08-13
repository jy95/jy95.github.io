import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetBacklogTierListQueryMock = vi.fn();

vi.mock('@/redux/services/tierListAPI', () => ({
    useGetBacklogTierListQuery: () => useGetBacklogTierListQueryMock(),
}));

vi.mock('@/components/tierList', () => ({
    TierLists: (props: { data?: Record<string, unknown[]>; isLoadingData?: boolean }) => (
        <div data-testid="tier-lists" data-loading={String(props.isLoadingData)}>
            {props.data ? Object.keys(props.data).join(',') : 'no-data'}
        </div>
    ),
}));

vi.mock('@/components/GamesView/BaseCard', () => ({
    default: () => <div>card</div>,
}));

import BacklogTierList from './page';

describe('BacklogTierList (tier/backlog page)', () => {
    it('forwards the loading state to TierLists', () => {
        useGetBacklogTierListQueryMock.mockReturnValue({ data: undefined, isLoading: true });
        render(<BacklogTierList />);
        expect(screen.getByTestId('tier-lists')).toHaveAttribute('data-loading', 'true');
    });

    it('forwards fetched backlog tier data to TierLists', () => {
        useGetBacklogTierListQueryMock.mockReturnValue({
            data: { tier_average: [], tier_poor: [] },
            isLoading: false,
        });
        render(<BacklogTierList />);
        const el = screen.getByTestId('tier-lists');
        expect(el).toHaveTextContent('tier_average,tier_poor');
        expect(el).toHaveAttribute('data-loading', 'false');
    });
});
