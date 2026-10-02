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
    const query = useSearchParams().toString();
    const params = useMemo(() => new URLSearchParams(query), [query]);
    const decoded = useSharedSelection(query);
    const locale = useLocale() as 'en' | 'fr';
    const sharing = useSelectionShare(query, locale);
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.selectedIds, resolved.categories, sharing.share);
    const { filters, updateFilters } = useGamesFilters();
    const [kind, setKind] = useState<SelectionKind>('all');

    const filteredEntries = useMemo(
        () => resolved.entries.filter(entry => kind === 'all' || entry.category === kind),
        [resolved.entries, kind],
    );

    const visibleEntries = useMemo(
        () => browseGames(filteredEntries.map(entry => ({ ...entry.game, entry })), filters).map(game => game.entry),
        [filteredEntries, filters],
    );

    const hasSelection = resolved.ids.length > 0;
    const canImport = resolved.selectedIds.some(id => !resolved.ids.includes(id));

    return {
        ...resolved,
        ...actions,
        decoded,
        sharing,
        filters,
        updateFilters,
        kind,
        setKind,
        visibleEntries,
        shared: decoded.kind !== 'absent',
        canImport,
        loading: !resolved.hydrated || decoded.kind === 'processing',
        hasSelection,
    };
}

export type SelectionPageModel = ReturnType<typeof useSelectionPage>;
