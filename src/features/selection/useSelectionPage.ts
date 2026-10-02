import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { browseGames } from '@/lib/browseGames';
import { addSelection, clearSelection, setSelectionCategories } from './selectionSlice';
import { classifySelection, selectionIds } from './schema';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { resolveSelectionCatalogue } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';

export function useSelectionPage(catalogue: SelectionEntry[]) {
    const query = useSearchParams().toString();
    const decoded = useSharedSelection(query);
    const sharing = useSelectionShare(query, useLocale() as 'en' | 'fr');
    const shared = decoded.kind !== 'absent';
    const categories = useMemo(() => Object.fromEntries(catalogue.map(entry => [entry.selectionId, entry.category])), [catalogue]);
    const { ids, hydrated, storageAvailable } = useAppSelector(state => state.selection);
    const dispatch = useAppDispatch();
    const { filters, updateFilters } = useGamesFilters();
    const [clearOpen, setClearOpen] = useState(false);
    const [detail, setDetail] = useState<SelectionEntry | null>(null);
    useEffect(() => { dispatch(setSelectionCategories(categories)); }, [dispatch, categories]);
    const document = decoded.kind === 'selection' ? decoded.document : null;
    const requested = shared ? selectionIdsOrEmpty(document) : ids;
    const resolved = resolveSelectionCatalogue(catalogue, requested, document);
    const visible = browseGames(resolved.entries.map(entry => ({ ...entry.game, entry })), filters).map(game => game.entry);
    const canImport = resolved.selectedIds.some(id => !ids.includes(id));
    const selectionDocument = () => classifySelection(resolved.selectedIds, categories);
    function confirmClear() { dispatch(clearSelection()); setClearOpen(false); }
    return {
        ...resolved, shared, decoded, sharing, storageAvailable, filters, updateFilters, visible, canImport,
        loading: !hydrated || decoded.kind === 'processing', hasSelection: ids.length > 0,
        clearOpen, openClear: () => setClearOpen(true), closeClear: () => setClearOpen(false), confirmClear,
        detail, setDetail, closeDetail: () => setDetail(null),
        importSelection: () => dispatch(addSelection(selectionDocument())),
        shareSelection: () => sharing.share(selectionDocument()),
    };
}

function selectionIdsOrEmpty(document: Parameters<typeof selectionIds>[0] | null): string[] {
    return document ? selectionIds(document) : [];
}

export type SelectionPageModel = ReturnType<typeof useSelectionPage>;
