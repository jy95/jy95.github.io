import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => `translated:${key}`,
}));

import GamesRow from './GamesRow';
import type { RawType } from './index';

type Item = RawType & { name: string };

const GameRender = ({ game }: { game: Item }) => <div>{game.name}</div>;

describe('GamesRow', () => {
    it('renders the translated empty message when items is empty', () => {
        render(<GamesRow items={[]} GameRender={GameRender} />);
        expect(screen.getByText('translated:empty')).toBeInTheDocument();
    });

    it('renders each item via GameRender when items are present', () => {
        const items: Item[] = [
            { id: '1', name: 'Game A' },
            { id: '2', name: 'Game B' },
        ];
        render(<GamesRow items={items} GameRender={GameRender} />);
        expect(screen.getByText('Game A')).toBeInTheDocument();
        expect(screen.getByText('Game B')).toBeInTheDocument();
    });

    it('does not render the empty message when items are present', () => {
        const items: Item[] = [{ id: '1', name: 'Game A' }];
        render(<GamesRow items={items} GameRender={GameRender} />);
        expect(screen.queryByText('translated:empty')).not.toBeInTheDocument();
    });

    it('renders one entry per item, preserving order', () => {
        const items: Item[] = [
            { id: '1', name: 'First' },
            { id: '2', name: 'Second' },
            { id: '3', name: 'Third' },
        ];
        render(<GamesRow items={items} GameRender={GameRender} />);
        const rendered = [
            screen.getByText('First'),
            screen.getByText('Second'),
            screen.getByText('Third'),
        ];
        expect(rendered.every(Boolean)).toBe(true);
    });

    it('re-renders correctly when switching from populated to empty items', () => {
        const items: Item[] = [{ id: '1', name: 'Solo Game' }];
        const { rerender } = render(<GamesRow items={items} GameRender={GameRender} />);
        expect(screen.getByText('Solo Game')).toBeInTheDocument();

        rerender(<GamesRow items={[]} GameRender={GameRender} />);
        expect(screen.queryByText('Solo Game')).not.toBeInTheDocument();
        expect(screen.getByText('translated:empty')).toBeInTheDocument();
    });
});
