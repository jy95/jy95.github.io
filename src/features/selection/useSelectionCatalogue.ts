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

    const document = decoded.kind === 'selection' ? decoded.document : decoded.kind === 'absent' ? selection.document : null;
    const resolved = useMemo(
        () => resolveSelectionCatalogue(catalogue, document, byId),
        [catalogue, document, byId],
    );

    return {
        ids: selection.ids,
        document,
        personalDocument: selection.document,
        hydrated: selection.hydrated,
        storageAvailable: selection.storageAvailable,
        entries: resolved.entries,
        unavailable: resolved.unavailable,
    };
}
