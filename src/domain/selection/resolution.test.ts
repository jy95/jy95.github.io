import { describe, expect, it } from 'vitest';
import { resolveSelection } from '@/domain/selection/resolution';
import type { SelectionDocument, SelectionEntry } from '@/domain/selection/types';

describe('resolveSelection', () => {
  const catalogue: SelectionEntry[] = [
    {
      selectionId: 'game-1',
      game: { id: 'game-1', title: 'Game 1', imagePath: '/cover.webp' },
      source: 'backlog',
      category: 'backlog',
    },
  ];

  const documentWithMissing: SelectionDocument = {
    games: ['ghost-game'],
    backlog: ['game-1'],
    dlcs: [],
    planning: [],
  };

  it('reports missing items without mutating the document', () => {
    const before = structuredClone(documentWithMissing);
    const resolved = resolveSelection(catalogue, documentWithMissing);

    expect(resolved.entries).toHaveLength(1);
    expect(resolved.entries[0].selectionId).toBe('game-1');
    expect(resolved.missing).toEqual([{ category: 'games', selectionId: 'ghost-game' }]);
    expect(documentWithMissing).toEqual(before);
  });
});
 it('resolves the same identifier independently in different categories', () => {
    const game = { id: 'same', title: 'Same', imagePath: '/cover.webp' };
    const entries: SelectionEntry[] = [
        { source: 'backlog', category: 'backlog', selectionId: 'same', game },
        { source: 'planning', category: 'planning', selectionId: 'same', game: { ...game, url: '', url_type: 'VIDEO', status: 'PENDING' } },
    ];
    const document = { games: [], dlcs: [], backlog: ['same'], planning: ['same'] };
    const before = structuredClone(document);
    expect(resolveSelection(entries, document)).toEqual({ entries, missing: [] });
    expect(document).toEqual(before);
 });

it('preserves category/identifier order', () => {
    const game = { id: 'same', title: 'Same', imagePath: '/cover.webp' };
    const games: SelectionEntry = { source: 'published', category: 'games', selectionId: 'same', game: { ...game, url: 'same', url_type: 'VIDEO' } };
    const backlog: SelectionEntry = { source: 'backlog', category: 'backlog', selectionId: 'same', game };
    const document: SelectionDocument = { games: ['missing-2', 'same', 'missing-1'], dlcs: ['dlc'], backlog: ['same', 'absent'], planning: ['planned'] };
    const resolved = resolveSelection([backlog, games], document);
    expect(resolved.entries).toEqual([games, backlog]);
    expect(resolved.missing).toEqual([
        { category: 'games', selectionId: 'missing-2' },
        { category: 'games', selectionId: 'missing-1' },
        { category: 'backlog', selectionId: 'absent' },
        { category: 'dlcs', selectionId: 'dlc' },
        { category: 'planning', selectionId: 'planned' },
    ]);
});
