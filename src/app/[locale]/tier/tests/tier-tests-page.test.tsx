import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentProps, ComponentType } from 'react';
import type { CardGame } from '@/domain/games';
import type CardEntry from '@/features/games/components/CardEntry';

const testGame: CardGame = {
    id: 'test-video',
    title: 'Test review',
    url: 'https://www.youtube.com/watch?v=test-video',
    url_type: 'VIDEO',
    imagePath: '/covers/test-video/cover.webp',
};

const useGetTestsTierListQueryMock = vi.fn();

vi.mock('@/redux/services/tierListAPI', () => ({
    useGetTestsTierListQuery: () => useGetTestsTierListQueryMock(),
}));

vi.mock('@/components/tierList', () => ({
    TierLists: (props: {
        data?: Record<string, unknown[]>;
        isLoadingData?: boolean;
        skipEmptyCategories?: boolean;
        GameRender: ComponentType<{ game: CardGame }>;
    }) => (
        <div
            data-testid="tier-lists"
            data-loading={String(props.isLoadingData)}
            data-skip-empty={String(props.skipEmptyCategories)}
        >
            {props.data ? Object.keys(props.data).join(',') : 'no-data'}
            <props.GameRender game={testGame} />
        </div>
    ),
}));

vi.mock('@/features/games/components/CardEntry', () => ({
    default: ({ game, selectable, showDetails }: ComponentProps<typeof CardEntry>) => (
        <div data-testid="review-card" data-selectable={String(selectable)} data-show-details={String(showDetails)}>{game.title}</div>
    ),
}));

import GamesTierList from './page';

describe('GamesTierList (tier/tests page)', () => {
    it('disables selection and details on review cards', () => {
        useGetTestsTierListQueryMock.mockReturnValue({ data: { tier_good: [testGame] }, isLoading: false });
        render(<GamesTierList />);
        const card = screen.getByTestId('review-card');
        expect(card).toHaveTextContent('Test review');
        expect(card).toHaveAttribute('data-selectable', 'false');
        expect(card).toHaveAttribute('data-show-details', 'false');
    });

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
