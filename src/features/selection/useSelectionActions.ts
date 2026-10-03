import { useState } from 'react';
import { useToggle } from '@/hooks/useToggle';
import { addSelection, clearSelection } from './selectionPersistence';
import { selectionDocumentOf } from './resolveCatalogue';
import type { SelectionDocument } from './documentTypes';
import type { SelectionEntry } from './catalogue';

export function useSelectionActions(
    entries: SelectionEntry[],
    share: (document: SelectionDocument) => Promise<void>,
) {
    const [clearOpen, , setClearOpen] = useToggle();
    const [detail, setDetail] = useState<SelectionEntry | null>(null);

    return {
        clearOpen,
        openClear: () => setClearOpen(true),
        closeClear: () => setClearOpen(false),
        // Always close: if storage failed, the page-level "storage unavailable"
        // alert reports it. Keeping a modal open with no feedback is worse.
        confirmClear: () => { clearSelection(); setClearOpen(false); },
        detail,
        setDetail,
        closeDetail: () => setDetail(null),
        importSelection: () => addSelection(selectionDocumentOf(entries)),
        shareSelection: () => share(selectionDocumentOf(entries)),
    };
}