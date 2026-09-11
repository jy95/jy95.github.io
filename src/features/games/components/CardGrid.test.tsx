import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { CardGame } from '@/domain/games/types';
import CardEntry from './CardEntry';
import { CardGrid } from './CardGrid';

vi.mock('@mui/material/Grid', () => ({
  default: (props: {
    children: React.ReactNode;
    container?: boolean;
    spacing?: number;
    rowSpacing?: number;
    size?: Record<string, number>;
  }) => (
    <div
      data-testid={props.container ? 'card-grid' : 'card-grid-item'}
      data-spacing={props.spacing}
      data-row-spacing={props.rowSpacing}
      data-size={props.size ? JSON.stringify(props.size) : undefined}
    >
      {props.children}
    </div>
  ),
}));

vi.mock('./CardEntry', () => ({
  default: ({ game }: ComponentProps<typeof CardEntry>) => (
    <div data-testid="card-entry" data-game-id={game.id}>
      {game.title}
    </div>
  ),
}));

const mockGames: CardGame[] = [
  {
    id: 'game-1',
    title: 'Game One',
    url: 'https://example.com/game-1',
    url_type: 'VIDEO',
    imagePath: '/covers/game-1.webp',
  },
  {
    id: 'game-2',
    title: 'Game Two',
    url: 'https://example.com/game-2',
    url_type: 'PLAYLIST',
    imagePath: '/covers/game-2.webp',
  },
];

describe('CardGrid', () => {
  it('renders one CardEntry for each item', () => {
    render(<CardGrid items={mockGames} size={{ xs: 12, md: 4 }} />);

    expect(screen.getAllByTestId('card-entry')).toHaveLength(2);
    expect(screen.getByText('Game One')).toBeInTheDocument();
    expect(screen.getByText('Game Two')).toBeInTheDocument();
  });

  it('forwards each game to its matching CardEntry', () => {
    render(<CardGrid items={mockGames} size={{ xs: 12 }} />);

    expect(screen.getByText('Game One')).toHaveAttribute('data-game-id', 'game-1');
    expect(screen.getByText('Game Two')).toHaveAttribute('data-game-id', 'game-2');
  });

  it('applies the supplied size to every grid item', () => {
    const size = { xs: 12, sm: 6, lg: 3 };

    render(<CardGrid items={mockGames} size={size} />);

    for (const gridItem of screen.getAllByTestId('card-grid-item')) {
      expect(gridItem).toHaveAttribute('data-size', JSON.stringify(size));
    }
  });

  it('uses spacing and rowSpacing of 1 on the grid container', () => {
    render(<CardGrid items={mockGames} size={{ xs: 12 }} />);

    expect(screen.getByTestId('card-grid')).toHaveAttribute('data-spacing', '1');
    expect(screen.getByTestId('card-grid')).toHaveAttribute('data-row-spacing', '1');
  });

  it('renders no grid items when items is empty', () => {
    render(<CardGrid items={[]} size={{ xs: 12 }} />);

    expect(screen.getByTestId('card-grid')).toBeInTheDocument();
    expect(screen.queryAllByTestId('card-grid-item')).toHaveLength(0);
    expect(screen.queryAllByTestId('card-entry')).toHaveLength(0);
  });
});