import { renderHook, waitFor } from '@testing-library/react';
import { createProviders, catalogue } from './testUtils';
import { useSelectionCatalogue } from './useSelectionCatalogue';
import { emptySelection } from './documentTypes';
import type { SelectionEntry } from './catalogue';

it('prepares entry lookups with first-duplicate precedence and safe property names', async () => {
    const names = ['constructor', 'toString', '__proto__'];
    const first = names.map((id): SelectionEntry => ({
        source: 'published', category: 'games', selectionId: id,
        game: { ...catalogue[0].game, id, url_type: 'VIDEO', url: 'https://youtube.com' },
    }));
    const last: SelectionEntry = { ...first[0], category: 'dlcs' };
    const entries = [...first, last];
    const { wrapper, selection } = createProviders(names);
    const { result, rerender } = renderHook(
        ({ shared }) => useSelectionCatalogue(entries, shared ? { kind: 'selection', document: { ...emptySelection(), dlcs: ['constructor'] } } : { kind: 'absent' }),
        { wrapper, initialProps: { shared: false } },
    );
    await waitFor(() => expect(selection.getState().document.games).toEqual(names));
    expect(result.current.entries).toEqual(first);
    rerender({ shared: true });
    expect(result.current.entries).toEqual([]);
    expect(result.current.unavailable).toBe(1);
});
