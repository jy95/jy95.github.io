import { useMemo } from 'react';
import { usePersonalSelection } from './selectionHooks';
import { indexCatalogue, resolveSelectionCatalogue, type CatalogueIndex } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import type { SelectionDocument } from './documentTypes';
import type { SharedSelectionState } from './useSharedSelection';

/** Which document the page displays: the shared one, the personal one, or nothing while pending or invalid. */
const pageDocument = (decoded: SharedSelectionState, own: SelectionDocument): SelectionDocument | null =>
    decoded.kind === 'selection' ? decoded.document : decoded.kind === 'absent' ? own : null;

export function resolvePageSelection(
    catalogue: SelectionEntry[],
    ownDocument: SelectionDocument,
    decoded: SharedSelectionState,
    byId?: CatalogueIndex,
) {
    return resolveSelectionCatalogue(catalogue, pageDocument(decoded, ownDocument), byId);
}

export function useSelectionCatalogue(catalogue: SelectionEntry[], decoded: SharedSelectionState) {
    const byId = useMemo(() => indexCatalogue(catalogue), [catalogue]);
    const selection = usePersonalSelection();
    const document = pageDocument(decoded, selection.document);
    const resolved = useMemo(
        () => resolveSelectionCatalogue(catalogue, document, byId),
        [catalogue, document, byId],
    );

    return {
        ids: selection.ids,
        personalDocument: selection.document,
        hydrated: selection.hydrated,
        storageAvailable: selection.storageAvailable,
        entries: resolved.entries,
        unavailable: resolved.unavailable,
    };
}