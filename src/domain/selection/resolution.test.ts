import { describe, expect, it } from 'vitest';
import { resolveSelection } from '@/domain/selection/resolution';
import type { SelectionDocument, SelectionEntry } from '@/domain/selection/types';

describe('resolveSelection', () => {
  const catalogue: SelectionEntry[] = [
    {
      category: 'games',
      selectionId: 'game-1',
      game: { id: 'game-1', title: 'Game 1' } as any,
      source: {} as any,
    },
  ];

  const documentWithMissing: SelectionDocument = {
    games: ['game-1', 'ghost-game'],
    backlog: [],
    dlcs: [],
    planning: [],
  };

  it('preserves missing items during catalog resolution', () => {
    const resolved = resolveSelection(catalogue, documentWithMissing);

    expect(resolved.entries).toHaveLength(1);
    expect(resolved.entries[0].selectionId).toBe('game-1');
    expect(resolved.missing).toEqual([{ category: 'games', selectionId: 'ghost-game' }]);
    expect(resolved.document.games).toContain('ghost-game');
  });
});