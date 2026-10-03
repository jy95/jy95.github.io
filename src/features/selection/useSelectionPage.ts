import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { usePagedSlice } from '@/hooks/usePagedSlice';
import { browseGames } from '@/lib/browseGames';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { useSelectionCatalogue } from './useSelectionCatalogue';
import { useSelectionActions } from './useSelectionActions';
import { hasUnimportedEntries } from './resolveCatalogue';
import type { SelectionKind } from './documentTypes';
import type { SelectionEntry } from './catalogue';

const PAGE_SIZE = 12;

export function useSelectionPage(catalogue: SelectionEntry[]) {
    const params = useSearchParams();
    const decoded = useSharedSelection(params);
    const sharing = useSelectionShare(JSON.stringify(params.getAll('entries')));
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.entries, sharing.share);
    const { filters, updateFilters } = useGamesFilters();
    const [kind, setKind] = useState<SelectionKind>('all');
    const { entries, ids } = resolved;

    // Flatten each entry into a browsable record once per entry set, not per filter change.
    const browsable = useMemo(() => entries.map(entry => ({ ...entry.game, entry })), [entries]);

    const filteredEntries = useMemo(() => {
        const scoped = kind === 'all' ? browsable : browsable.filter(item => item.entry.category === kind);
        return browseGames(scoped, filters).map(item => item.entry);
    }, [browsable, kind, filters]);

    const { visible: visibleEntries, hasMore, loadMore } = usePagedSlice(filteredEntries, PAGE_SIZE);

    const canImport = useMemo(
        () => hasUnimportedEntries(entries, resolved.personalDocument),
        [entries, resolved.personalDocument],
    );

    const decodeError = decoded.kind === 'error' ? decoded.error : null;
    const decoding = decoded.kind === 'processing';

    return {
        ...actions,
        decodeError,
        decoding,
        encoding: sharing.state.kind === 'processing',
        hasEntries: entries.length > 0,
        sharing,
        filters,
        updateFilters,
        kind,
        setKind,
        visibleEntries,
        loadMore,
        hasMore,
        canImport,
        entries,
        unavailable: resolved.unavailable,
        storageAvailable: resolved.storageAvailable,
        shared: decoded.kind !== 'absent',
        loading: !resolved.hydrated || decoding,
        hasSelection: ids.length > 0,
    };
}

export type SelectionPageModel = ReturnType<typeof useSelectionPage>;