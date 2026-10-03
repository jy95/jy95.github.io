import { useState } from 'react';
import { useToggle } from '@/hooks/useToggle';
import { useAppDispatch } from '@/redux/hooks';
import { addSelection, clearSelection } from './selectionSlice';
import { emptySelection, type SelectionDocument } from './documentTypes';
import type { SelectionEntry } from './catalogue';

export function useSelectionActions(
    entries: SelectionEntry[],
    share: (document: SelectionDocument) => Promise<void>,
) {
    const dispatch = useAppDispatch();
    const [clearOpen, , setClearOpen] = useToggle();
    const [detail, setDetail] = useState<SelectionEntry | null>(null);

    // Build the document to import/share from resolved entries
    const selectionDocument = (): SelectionDocument => {
        const doc = emptySelection();
        for (const entry of entries) doc[entry.category].push(entry.game.id);
        return doc;
    };

    function confirmClear() {
        dispatch(clearSelection());
        setClearOpen(false);
    }

    return {
        clearOpen,
        openClear: () => setClearOpen(true),
        closeClear: () => setClearOpen(false),
        confirmClear,
        detail,
        setDetail,
        closeDetail: () => setDetail(null),
        importSelection: () => dispatch(addSelection(selectionDocument())),
        shareSelection: () => share(selectionDocument()),
    };
}
