import { useState } from 'react';
import { useToggle } from '@/hooks/useToggle';
import { addSelection, clearSelection } from './selectionPersistence';
import { emptySelection, type SelectionDocument } from './documentTypes';
import type { SelectionEntry } from './catalogue';

export function useSelectionActions(
    entries: SelectionEntry[],
    share: (document: SelectionDocument) => Promise<void>,
) {
    const [clearOpen, , setClearOpen] = useToggle();
    const [detail, setDetail] = useState<SelectionEntry | null>(null);

    // Build the document to import/share from resolved entries
    const selectionDocument = (): SelectionDocument => {
        const doc = emptySelection();
        for (const entry of entries) doc[entry.category].push(entry.selectionId);
        return doc;
    };

    function confirmClear() {
        if (clearSelection()) setClearOpen(false);
    }

    return {
        clearOpen,
        openClear: () => setClearOpen(true),
        closeClear: () => setClearOpen(false),
        confirmClear,
        detail,
        setDetail,
        closeDetail: () => setDetail(null),
        importSelection: () => addSelection(selectionDocument()),
        shareSelection: () => share(selectionDocument()),
    };
}
