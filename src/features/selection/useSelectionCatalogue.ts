import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSelectionCategories } from './selectionSlice';
import { selectionIds } from './identifiers';
import { indexCatalogue, resolveSelectionCatalogue, type CatalogueIndex } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import type { SelectionCategories } from './documentTypes';
import type { SharedSelectionState } from './useSharedSelection';

export function resolvePageSelection(catalogue: SelectionEntry[], ids: string[], decoded: SharedSelectionState, byId?: CatalogueIndex) {
    switch (decoded.kind) {
        case 'absent': return resolveSelectionCatalogue(catalogue, ids, null, byId);
        case 'selection': return resolveSelectionCatalogue(catalogue, selectionIds(decoded.document), decoded.document, byId);
        default: return resolveSelectionCatalogue(catalogue, [], null, byId);
    }
}

export function useSelectionCatalogue(catalogue: SelectionEntry[], decoded: SharedSelectionState) {
    // Built once per catalogue instead of on every render.
    const { byId, categories } = useMemo(() => ({
        byId: indexCatalogue(catalogue),
        categories: Object.fromEntries(catalogue.map(entry => [entry.selectionId, entry.category])) as SelectionCategories,
    }), [catalogue]);
    const selection = useAppSelector(state => state.selection);
    const dispatch = useAppDispatch();
    useEffect(() => { dispatch(setSelectionCategories(categories)); }, [dispatch, categories]);
    const resolved = useMemo(
        () => resolvePageSelection(catalogue, selection.ids, decoded, byId),
        [catalogue, selection.ids, decoded, byId],
    );
    return { ...selection, categories, ...resolved };
}