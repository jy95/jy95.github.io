import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSelectionCategories } from './selectionSlice';
import { selectionIds } from './identifiers';
import { resolveSelectionCatalogue, type CatalogueIndex } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import type { SelectionCategories } from './documentTypes';
import type { SharedSelectionState } from './useSharedSelection';

export function resolvePageSelection(catalogue: SelectionEntry[], ids: string[], decoded: SharedSelectionState, byId?: CatalogueIndex) {
    const document = decoded.kind === 'selection' ? decoded.document : null;
    const requested = document ? selectionIds(document) : decoded.kind === 'absent' ? ids : [];
    return resolveSelectionCatalogue(catalogue, requested, document, byId);
}

export function useSelectionCatalogue(catalogue: SelectionEntry[], decoded: SharedSelectionState) {
    const { byId, categories } = useMemo(() => {
        const byId = new Map<string, SelectionEntry>();
        const categories: SelectionCategories = Object.create(null);
        // Match the resolver's last-occurrence precedence for duplicate identifiers.
        for (const entry of catalogue) {
            byId.set(entry.selectionId, entry);
            categories[entry.selectionId] = entry.category;
        }
        return { byId, categories };
    }, [catalogue]);
    const selection = useAppSelector(state => state.selection);
    const dispatch = useAppDispatch();
    useEffect(() => { dispatch(setSelectionCategories(categories)); }, [dispatch, categories]);
    const resolved = useMemo(
        () => resolvePageSelection(catalogue, selection.ids, decoded, byId),
        [catalogue, selection.ids, decoded, byId],
    );
    return {
        ids: selection.ids,
        hydrated: selection.hydrated,
        storageAvailable: selection.storageAvailable,
        categories,
        entries: resolved.entries,
        unavailable: resolved.unavailable,
        selectedIds: resolved.selectedIds,
    };
}
