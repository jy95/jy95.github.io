import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

import GamesRow from './GamesRow';
import type { RawType } from './index';

const GameRender = ({ game }: { game: RawType }) => <div>{game.id}</div>;

describe('GamesRow', () => {
    it('renders the empty message when items is an empty array', () => {
        render(<GamesRow items={[]} GameRender={GameRender} />);
        expect(screen.getByText('translated:empty')).toBeInTheDocument();
    });

    it('does not render the empty message when items are present', () => {
        render(<GamesRow items={[{ id: '1' }]} GameRender={GameRender} />);
        expect(screen.queryByText('translated:empty')).not.toBeInTheDocument();
    });

    it('renders one GameRender per item', () => {
        render(<GamesRow items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]} GameRender={GameRender} />);
        expect(screen.getByText('a')).toBeInTheDocument();
        expect(screen.getByText('b')).toBeInTheDocument();
        expect(screen.getByText('c')).toBeInTheDocument();
    });

    it('renders exactly the item content and nothing else when the list is non-empty', () => {
        const { container } = render(<GamesRow items={[{ id: '1' }]} GameRender={GameRender} />);
        expect(container.textContent).toBe('1');
    });

    it('renders a fresh set of items when the items prop changes (no stale content)', () => {
        const { rerender } = render(<GamesRow items={[{ id: 'first' }]} GameRender={GameRender} />);
        expect(screen.getByText('first')).toBeInTheDocument();

        rerender(<GamesRow items={[{ id: 'second' }]} GameRender={GameRender} />);
        expect(screen.getByText('second')).toBeInTheDocument();
        expect(screen.queryByText('first')).not.toBeInTheDocument();
    });

    it('switches from the empty message back to items when items becomes non-empty', () => {
        const { rerender } = render(<GamesRow items={[]} GameRender={GameRender} />);
        expect(screen.getByText('translated:empty')).toBeInTheDocument();

        rerender(<GamesRow items={[{ id: 'now-present' }]} GameRender={GameRender} />);
        expect(screen.queryByText('translated:empty')).not.toBeInTheDocument();
        expect(screen.getByText('now-present')).toBeInTheDocument();
    });
});
