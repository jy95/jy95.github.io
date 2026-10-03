import { useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { indexCatalogue, resolveSelectionCatalogue, type CatalogueIndex } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import type { SelectionDocument } from './documentTypes';
import type { SharedSelectionState } from './useSharedSelection';

export function resolvePageSelection(
    catalogue: SelectionEntry[],
    ownDocument: SelectionDocument,
    decoded: SharedSelectionState,
    byId?: CatalogueIndex,
) {
    const document = decoded.kind === 'selection' ? decoded.document : decoded.kind === 'absent' ? ownDocument : null;
    return resolveSelectionCatalogue(catalogue, document, byId);
}

export function useSelectionCatalogue(catalogue: SelectionEntry[], decoded: SharedSelectionState) {
    const byId = useMemo(() => indexCatalogue(catalogue), [catalogue]);
    const selection = useAppSelector(state => state.selection);

    // When viewing a shared selection, depend only on decoded document.
    // When in personal mode, depend on personal selection document.
    // This prevents shared catalogue resolution from re-running on personal selection changes.
    const resolved = useMemo(() => {
        if (decoded.kind === 'selection') {
            // Shared mode: use decoded document, ignore personal selection changes
            return resolveSelectionCatalogue(catalogue, decoded.document, byId);
        }
        if (decoded.kind === 'absent') {
            // Personal mode: use personal selection document
            return resolveSelectionCatalogue(catalogue, selection.document, byId);
        }
        // Error/processing: return empty
        return resolveSelectionCatalogue(catalogue, null, byId);
    }, [catalogue, decoded, selection.document, byId]);

    return {
        ids: selection.ids,
        document: decoded.kind === 'selection' ? decoded.document : selection.document,
        hydrated: selection.hydrated,
        storageAvailable: selection.storageAvailable,
        entries: resolved.entries,
        unavailable: resolved.unavailable,
    };
}
