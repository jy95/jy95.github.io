import { useMemo, useState } from 'react';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { usePagedSlice } from '@/hooks/usePagedSlice';
import { browseGames } from '@/lib/browseGames';
import type { SelectionKind } from './documentTypes';
import type { SelectionEntry } from './catalogue';
import type { SelectionBrowseModel } from './selectionModels';

const PAGE_SIZE = 12;

export function useSelectionBrowse(entries: readonly SelectionEntry[]): SelectionBrowseModel {
    const { filters, updateFilters } = useGamesFilters();
    const [kind, setKind] = useState<SelectionKind>('all');
    // Flatten each entry into a browsable record once per entry set, not per filter change.
    const browsable = useMemo(() => entries.map(entry => ({ ...entry.game, entry })), [entries]);

    const filteredEntries = useMemo(() => {
        const scoped = kind === 'all' ? browsable : browsable.filter(item => item.entry.category === kind);
        return browseGames(scoped, filters).map(item => item.entry);
    }, [browsable, kind, filters]);

    const { visible: visibleEntries, hasMore, loadMore } = usePagedSlice(filteredEntries, PAGE_SIZE);

    return { filters, updateFilters, kind, setKind, visibleEntries, hasMore, loadMore };
}
