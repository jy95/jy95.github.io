import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

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
          { id: 1, name: 'Series One', items: [mockGameOne] },
          { name: 'Series Two', items: [mockGameTwo] },
        ]}
        itemSize={{ xs: 12, md: 4 }}
      />
    );

    expect(screen.getByRole('button', { name: 'Series One' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Series Two' })).toBeInTheDocument();
  });

  it('connects unique header and content accessibility identifiers', () => {
    render(
      <GroupedGamesAccordion
        groups={[{ name: 'Series One', items: [mockGameOne] }]}
        itemSize={{ xs: 12 }}
      />
    );

    const summary = screen.getByRole('button', { name: 'Series One' });

    const content = document.getElementById(summary.getAttribute('aria-controls')!);
    expect(content).toHaveAttribute('aria-labelledby', summary.id);
    expect(summary.id).not.toMatch(/\s/);
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

it('keeps independently expanded custom groups stable across label and item changes', () => {
  const groups = [{ id: 'backlog', name: 'Backlog', items: [42] }, { id: 'planning', name: 'Planning', items: [7] }];
  const renderContent = (group: typeof groups[number]) => <p>{group.items.join(',')}</p>;
  const { rerender } = render(<GroupedGamesAccordion groups={groups} renderContent={renderContent} itemSize={{ xs: 12 }} />);
  const backlog = screen.getByRole('button', { name: 'Backlog' });
  backlog.focus();
  expect(backlog).toHaveFocus();
  expect(backlog.tagName).toBe('BUTTON');
  fireEvent.click(backlog);
  expect(backlog).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Planning' })).toHaveAttribute('aria-expanded', 'false');
  const id = backlog.id;
  rerender(<GroupedGamesAccordion groups={[{ ...groups[0], name: 'À jouer', items: [] }, groups[1]]} renderContent={renderContent} itemSize={{ xs: 12 }} />);
  expect(screen.getByRole('button', { name: 'À jouer' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'À jouer' }).id).toBe(id);
});

it('uses unique identifiers across accordion instances with the same labels', () => {
  const groups = [{ name: 'DLC', items: [mockGameOne] }];
  render(<><GroupedGamesAccordion groups={groups} itemSize={{ xs: 12 }} /><GroupedGamesAccordion groups={groups} itemSize={{ xs: 12 }} /></>);
  const summaries = screen.getAllByRole('button', { name: 'DLC' });
  expect(summaries[0].id).not.toBe(summaries[1].id);
});
