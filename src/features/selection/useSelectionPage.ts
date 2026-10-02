import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { browseGames } from '@/lib/browseGames';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { useSelectionCatalogue } from './useSelectionCatalogue';
import { useSelectionActions } from './useSelectionActions';
import { SELECTION_CATEGORIES, type SelectionCategory } from './documentTypes';
import type { SelectionEntry } from './catalogue';

export function useSelectionPage(catalogue: SelectionEntry[]) {
    const query = useSearchParams().toString();
    const decoded = useSharedSelection(query);
    const sharing = useSelectionShare(query, useLocale() as 'en' | 'fr');
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.selectedIds, resolved.categories, sharing.share);
    const { filters, updateFilters } = useGamesFilters();
    const [enabledKinds, setEnabledKinds] = useState<SelectionCategory[]>([...SELECTION_CATEGORIES]);
    const toggleKind = (kind: SelectionCategory) => setEnabledKinds(current => current.includes(kind)
        ? current.filter(category => category !== kind) : [...current, kind]);
    const visibleEntries = browseGames(resolved.entries.filter(entry => enabledKinds.includes(entry.category))
        .map(entry => ({ ...entry.game, entry })), filters).map(game => game.entry);
    return {
        ...resolved, ...actions, decoded, sharing, filters, updateFilters, enabledKinds, toggleKind, visibleEntries,
        shared: decoded.kind !== 'absent',
        canImport: resolved.selectedIds.some(id => !resolved.ids.includes(id)),
        loading: !resolved.hydrated || decoded.kind === 'processing', hasSelection: resolved.ids.length > 0,
    };
}

export type SelectionPageModel = ReturnType<typeof useSelectionPage>;
