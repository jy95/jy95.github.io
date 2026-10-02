import { useState } from 'react';
import { useToggle } from '@/hooks/useToggle';
import { useAppDispatch } from '@/redux/hooks';
import { addSelection, clearSelection } from './selectionSlice';
import { classifySelection } from './documentClassification';
import type { SelectionEntry } from './catalogue';
import type { SelectionCategories, SelectionDocument } from './documentTypes';

export function useSelectionActions(selectedIds: string[], categories: SelectionCategories, share: (document: SelectionDocument) => Promise<void>) {
    const dispatch = useAppDispatch();
    const [clearOpen, , setClearOpen] = useToggle();
    const [detail, setDetail] = useState<SelectionEntry | null>(null);
    const selectionDocument = () => classifySelection(selectedIds, categories);
    function confirmClear() { dispatch(clearSelection()); setClearOpen(false); }
    return {
        clearOpen, openClear: () => setClearOpen(true), closeClear: () => setClearOpen(false), confirmClear,
        detail, setDetail, closeDetail: () => setDetail(null),
        importSelection: () => dispatch(addSelection(selectionDocument())),
        shareSelection: () => share(selectionDocument()),
    };
}
