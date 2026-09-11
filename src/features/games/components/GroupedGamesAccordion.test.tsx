import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { CardGame } from '@/domain/games/types';
import { GroupedGamesAccordion } from './GroupedGamesAccordion';
import type { CardGrid } from './CardGrid';

vi.mock('./CardGrid', () => ({
  CardGrid: ({ items, size }: ComponentProps<typeof CardGrid>) => (
    <div
      data-testid="card-grid"
      data-item-ids={items.map((item) => item.id).join(',')}
      data-size={JSON.stringify(size)}
    >
      {items.length} items
    </div>
  ),
}));

const mockGameOne: CardGame = {
  id: 'game-1',
  title: 'Game One',
  url: 'https://example.com/game-1',
  url_type: 'VIDEO',
  imagePath: '/covers/game-1.webp',
};

const mockGameTwo: CardGame = {
  id: 'game-2',
  title: 'Game Two',
  url: 'https://example.com/game-2',
  url_type: 'PLAYLIST',
  imagePath: '/covers/game-2.webp',
};

describe('GroupedGamesAccordion', () => {
  it('renders one accordion summary for each group', () => {
    render(
      <GroupedGamesAccordion
        groups={[
          { name: 'Series One', items: [mockGameOne] },
          { name: 'Series Two', items: [mockGameTwo] },
        ]}
        itemSize={{ xs: 12, md: 4 }}
      />
    );

    expect(screen.getByRole('button', { name: 'Series One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Series Two' })).toBeInTheDocument();
  });

  it('uses the group name in each accordion accessibility identifiers', () => {
    render(
      <GroupedGamesAccordion
        groups={[{ name: 'Series One', items: [mockGameOne] }]}
        itemSize={{ xs: 12 }}
      />
    );

    const summary = screen.getByRole('button', { name: 'Series One' });

    expect(summary).toHaveAttribute('id', 'panel-headerSeries One');
    expect(summary).toHaveAttribute('aria-controls', 'panel-contentSeries One');
  });

  it('forwards each group items to its CardGrid', () => {
    render(
      <GroupedGamesAccordion
        groups={[
          { name: 'Series One', items: [mockGameOne, mockGameTwo] },
          { name: 'Series Two', items: [mockGameTwo] },
        ]}
        itemSize={{ xs: 12 }}
      />
    );

    const cardGrids = screen.getAllByTestId('card-grid');

    expect(cardGrids).toHaveLength(2);
    expect(cardGrids[0]).toHaveAttribute('data-item-ids', 'game-1,game-2');
    expect(cardGrids[1]).toHaveAttribute('data-item-ids', 'game-2');
  });

  it('forwards itemSize to every CardGrid', () => {
    const itemSize = { xs: 12, sm: 6, md: 4 };

    render(
      <GroupedGamesAccordion
        groups={[
          { name: 'Series One', items: [mockGameOne] },
          { name: 'Series Two', items: [mockGameTwo] },
        ]}
        itemSize={itemSize}
      />
    );

    for (const cardGrid of screen.getAllByTestId('card-grid')) {
      expect(cardGrid).toHaveAttribute('data-size', JSON.stringify(itemSize));
    }
  });

  it('renders an accordion and an empty CardGrid for an empty group', () => {
    render(
      <GroupedGamesAccordion
        groups={[{ name: 'Empty Series', items: [] }]}
        itemSize={{ xs: 12 }}
      />
    );

    expect(screen.getByRole('button', { name: 'Empty Series' })).toBeInTheDocument();
    expect(screen.getByTestId('card-grid')).toHaveAttribute('data-item-ids', '');
    expect(screen.getByTestId('card-grid')).toHaveTextContent('0 items');
  });

  it('renders nothing when groups is empty', () => {
    const { container } = render(<GroupedGamesAccordion groups={[]} itemSize={{ xs: 12 }} />);

    expect(container).toBeEmptyDOMElement();
  });
});