import { describe, expect, it, beforeEach } from 'vitest';
import { encodeSelection, decodeSelection } from '@/features/selection/sharing/sharing';
import { addSelection, clearSelection, getSelectionSnapshot } from '@/features/selection/storage/store';
import { emptySelection } from '@/domain/selection/operations';
import type { SelectionDocument } from '@/domain/selection/types';

describe('Selection Sharing & Store Integration', () => {
  const documentWithMissing: SelectionDocument = {
    ...emptySelection(),
    games: ['game-1', 'ghost-game'],
  };

  beforeEach(() => {
    window.localStorage.clear();
    clearSelection();
  });

  it('encodes and decodes selections without dropping missing entries', async () => {
    const encoded = await encodeSelection(documentWithMissing);
    const decoded = await decodeSelection(encoded);

    expect(decoded).toEqual(documentWithMissing);
    expect(decoded?.games).toContain('ghost-game');
  });

  it('imports shared selection via addSelection while preserving missing entries in local store', () => {
    addSelection(documentWithMissing);

    const snapshot = getSelectionSnapshot();
    expect(snapshot.document.games).toContain('game-1');
    expect(snapshot.document.games).toContain('ghost-game');
  });
});