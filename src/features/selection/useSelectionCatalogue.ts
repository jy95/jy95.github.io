import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSelectionCategories } from './selectionSlice';
import { selectionIds } from './identifiers';
import { indexCatalogue, resolveSelectionCatalogue, type CatalogueIndex } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import type { SelectionCategories, SelectionDocument } from './documentTypes';
import type { SharedSelectionState } from './useSharedSelection';

export function resolvePageSelection(catalogue: SelectionEntry[], ids: string[], decoded: SharedSelectionState, byId?: CatalogueIndex, ownDocument: SelectionDocument | null = null) {
    const document = decoded.kind === 'selection' ? decoded.document : decoded.kind === 'absent' ? ownDocument : null;
    const requested = document ? selectionIds(document) : decoded.kind === 'absent' ? ids : [];
    return resolveSelectionCatalogue(catalogue, requested, document, byId);
}

export function useSelectionCatalogue(catalogue: SelectionEntry[], decoded: SharedSelectionState) {
    const { byId, categories } = useMemo(() => {
        const byId = indexCatalogue(catalogue);
        const categories: SelectionCategories = Object.create(null);
        // Use the catalogue's first-occurrence precedence for duplicate identifiers.
        for (const entry of byId.values()) {
            categories[entry.selectionId] = entry.category;
        }
        return { byId, categories };
    }, [catalogue]);
    const selection = useAppSelector(state => state.selection);
    const dispatch = useAppDispatch();
    useEffect(() => { dispatch(setSelectionCategories(categories)); }, [dispatch, categories]);
    const resolved = useMemo(
        () => resolvePageSelection(catalogue, selection.ids, decoded, byId, selection.document),
        [catalogue, selection.ids, selection.document, decoded, byId],
    );
    return {
        ids: selection.ids,
        document: selection.document,
        hydrated: selection.hydrated,
        storageAvailable: selection.storageAvailable,
        categories,
        entries: resolved.entries,
        unavailable: resolved.unavailable,
        selectedIds: resolved.selectedIds,
    };
}
