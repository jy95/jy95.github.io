import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Echoes the key back so we can assert which category rows actually rendered.
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

import { TierListBoard } from './TierListBoard';
import type { RawType } from './index';

const GameRender = ({ game }: { game: RawType }) => <div>{game.id}</div>;

describe('TierListBoard', () => {
    const categories = ['tier_good', 'tier_bad'] as any;

    it('renders a row for every category by default, even empty ones', () => {
        render(
            <TierListBoard
                categories={categories}
                data={{ tier_good: [{ id: '1' }], tier_bad: [] }}
                categoryColors={{}}
                GameRender={GameRender}
            />
        );
        expect(screen.getByText('tier_good')).toBeInTheDocument();
        expect(screen.getByText('tier_bad')).toBeInTheDocument();
    });

    it('omits empty categories when skipEmptyCategories is true', () => {
        render(
            <TierListBoard
                categories={categories}
                data={{ tier_good: [{ id: '1' }], tier_bad: [] }}
                categoryColors={{}}
                GameRender={GameRender}
                skipEmptyCategories
            />
        );
        expect(screen.getByText('tier_good')).toBeInTheDocument();
        expect(screen.queryByText('tier_bad')).not.toBeInTheDocument();
    });

    it('keeps a category with skipEmptyCategories when it has at least one item', () => {
        render(
            <TierListBoard
                categories={categories}
                data={{ tier_good: [], tier_bad: [{ id: '1' }] }}
                categoryColors={{}}
                GameRender={GameRender}
                skipEmptyCategories
            />
        );
        expect(screen.queryByText('tier_good')).not.toBeInTheDocument();
        expect(screen.getByText('tier_bad')).toBeInTheDocument();
    });

    it('omits every row when all categories are empty and skipEmptyCategories is true', () => {
        render(
            <TierListBoard
                categories={categories}
                data={{ tier_good: [], tier_bad: [] }}
                categoryColors={{}}
                GameRender={GameRender}
                skipEmptyCategories
            />
        );
        expect(screen.queryByText('tier_good')).not.toBeInTheDocument();
        expect(screen.queryByText('tier_bad')).not.toBeInTheDocument();
    });

    it('treats a category missing entirely from data as empty', () => {
        render(
            <TierListBoard
                categories={categories}
                data={{ tier_good: [{ id: '1' }] }}
                categoryColors={{}}
                GameRender={GameRender}
                skipEmptyCategories
            />
        );
        expect(screen.getByText('tier_good')).toBeInTheDocument();
        expect(screen.queryByText('tier_bad')).not.toBeInTheDocument();
    });

    it('renders items for each category using GameRender', () => {
        render(
            <TierListBoard
                categories={categories}
                data={{ tier_good: [{ id: 'a' }, { id: 'b' }], tier_bad: [{ id: 'c' }] }}
                categoryColors={{}}
                GameRender={GameRender}
            />
        );
        expect(screen.getByText('a')).toBeInTheDocument();
        expect(screen.getByText('b')).toBeInTheDocument();
        expect(screen.getByText('c')).toBeInTheDocument();
    });
});
