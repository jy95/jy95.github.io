import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { browseGames } from '@/lib/browseGames';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { useSelectionCatalogue } from './useSelectionCatalogue';
import { useSelectionActions } from './useSelectionActions';
import type { SelectionKind } from './SelectionKindFilter';
import type { SelectionEntry } from './catalogue';

export function useSelectionPage(catalogue: SelectionEntry[]) {
    const params = useSearchParams();
    const query = params.toString();
    // Decode only when the `selection` parameter itself changes. Filter edits (title typing,
    // sort, platform...) rewrite the URL but must not trigger decompression or a spinner.
    const sharedQuery = new URLSearchParams(params.getAll('selection').map(value => ['selection', value])).toString();
    const decoded = useSharedSelection(sharedQuery);
    const sharing = useSelectionShare(query, useLocale() as 'en' | 'fr');
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.selectedIds, resolved.categories, sharing.share);
    const { filters, updateFilters } = useGamesFilters();
    const [kind, setKind] = useState<SelectionKind>('all');
    const { entries, ids, selectedIds } = resolved;

    // Fuse indexing and sorting only re-run when their inputs actually change.
    const visibleEntries = useMemo(() => {
        const scoped = kind === 'all' ? entries : entries.filter(entry => entry.category === kind);
        return browseGames(scoped.map(entry => ({ ...entry.game, entry })), filters).map(game => game.entry);
    }, [entries, kind, filters]);

    const canImport = useMemo(() => {
        const own = new Set(ids);
        return selectedIds.some(id => !own.has(id));
    }, [ids, selectedIds]);

    return {
        ...resolved, ...actions, decoded, sharing, filters, updateFilters, kind, setKind, visibleEntries, canImport,
        shared: decoded.kind !== 'absent',
        loading: !resolved.hydrated || decoded.kind === 'processing',
        hasSelection: ids.length > 0,
    };
}

export type SelectionPageModel = ReturnType<typeof useSelectionPage>;