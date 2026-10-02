import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSelectionCategories } from './selectionSlice';
import { selectionIds } from './identifiers';
import { resolveSelectionCatalogue } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import type { SharedSelectionState } from './useSharedSelection';

export function resolvePageSelection(catalogue: SelectionEntry[], ids: string[], decoded: SharedSelectionState) {
    if (decoded.kind === 'absent') return resolveSelectionCatalogue(catalogue, ids);
    if (decoded.kind === 'selection') return resolveSelectionCatalogue(catalogue, selectionIds(decoded.document), decoded.document);
    return resolveSelectionCatalogue(catalogue, []);
}

export function useSelectionCatalogue(catalogue: SelectionEntry[], decoded: SharedSelectionState) {
    const categories = useMemo(() => Object.fromEntries(catalogue.map(entry => [entry.selectionId, entry.category])), [catalogue]);
    const selection = useAppSelector(state => state.selection);
    const dispatch = useAppDispatch();
    useEffect(() => { dispatch(setSelectionCategories(categories)); }, [dispatch, categories]);
    return { ...selection, categories, ...resolvePageSelection(catalogue, selection.ids, decoded) };
}
