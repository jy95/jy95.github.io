import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
    // Decode only when the `selection` parameter itself changes. Filter edits (title typing,
    // sort, platform...) rewrite the URL but must not trigger decompression or a spinner.
    const sharedQuery = new URLSearchParams(params.getAll('selection').map(value => ['selection', value])).toString();
    const decoded = useSharedSelection(sharedQuery);
    // Locale argument removed as useSelectionShare consumes useLocale internally
    const sharing = useSelectionShare(decoded.kind !== 'absent');
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.entries, sharing.share);
    const { filters, updateFilters } = useGamesFilters();
    const [kind, setKind] = useState<SelectionKind>('all');
    const { entries, ids } = resolved;

    // Fuse indexing and sorting only re-run when their inputs actually change.
    const visibleEntries = useMemo(() => {
        const scoped = kind === 'all' ? entries : entries.filter(entry => entry.category === kind);
        return browseGames(scoped.map(entry => ({ ...entry.game, entry })), filters).map(game => game.entry);
    }, [entries, kind, filters]);

    const canImport = useMemo(() => {
        return entries.some(entry => !resolved.document[entry.category].includes(entry.game.id));
    }, [resolved.document, entries]);

    const decodeError = decoded.kind === 'error' ? decoded.error : null;
    const decoding = decoded.kind === 'processing';
    const encoding = sharing.state.kind === 'processing';
    const hasEntries = entries.length > 0;

    return {
        ...actions,
        decodeError,
        decoding,
        encoding,
        hasEntries,
        sharing,
        filters,
        updateFilters,
        kind,
        setKind,
        visibleEntries,
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