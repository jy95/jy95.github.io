import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { browseGames } from '@/lib/browseGames';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { useSelectionCatalogue } from './useSelectionCatalogue';
import { useSelectionActions } from './useSelectionActions';
import type { SelectionEntry } from './catalogue';

export function useSelectionPage(catalogue: SelectionEntry[]) {
    const query = useSearchParams().toString();
    const decoded = useSharedSelection(query);
    const sharing = useSelectionShare(query, useLocale() as 'en' | 'fr');
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.selectedIds, resolved.categories, sharing.share);
    const { filters, updateFilters } = useGamesFilters();
    const visible = browseGames(resolved.entries.map(entry => ({ ...entry.game, entry })), filters).map(game => game.entry);
    return {
        ...resolved, ...actions, decoded, sharing, filters, updateFilters, visible,
        shared: decoded.kind !== 'absent',
        canImport: resolved.selectedIds.some(id => !resolved.ids.includes(id)),
        loading: !resolved.hydrated || decoded.kind === 'processing', hasSelection: resolved.ids.length > 0,
    };
}

export type SelectionPageModel = ReturnType<typeof useSelectionPage>;
