import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useGetTestsTierListQueryMock = vi.fn();

vi.mock('@/redux/services/tierListAPI', () => ({
    useGetTestsTierListQuery: () => useGetTestsTierListQueryMock(),
}));

vi.mock('@/components/tierList', () => ({
    TierLists: (props: {
        data?: Record<string, unknown[]>;
        isLoadingData?: boolean;
        skipEmptyCategories?: boolean;
    }) => (
        <div
            data-testid="tier-lists"
            data-loading={String(props.isLoadingData)}
            data-skip-empty={String(props.skipEmptyCategories)}
        >
            {props.data ? Object.keys(props.data).join(',') : 'no-data'}
        </div>
    ),
}));

vi.mock('@/components/GamesView/CardEntry', () => ({
    default: () => <div>card</div>,
}));

import GamesTierList from './page';

describe('GamesTierList (tier/tests page)', () => {
    it('forwards the loading state to TierLists', () => {
        useGetTestsTierListQueryMock.mockReturnValue({ data: undefined, isLoading: true });
        render(<GamesTierList />);
        expect(screen.getByTestId('tier-lists')).toHaveAttribute('data-loading', 'true');
    });

    it('forwards fetched data and requests skipping empty categories', () => {
        useGetTestsTierListQueryMock.mockReturnValue({
            data: { tier_good: [], tier_bad: [] },
            isLoading: false,
        });
        render(<GamesTierList />);
        const el = screen.getByTestId('tier-lists');
        expect(el).toHaveTextContent('tier_good,tier_bad');
        expect(el).toHaveAttribute('data-skip-empty', 'true');
    });
});
