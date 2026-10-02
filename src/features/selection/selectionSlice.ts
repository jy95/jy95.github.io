import { createSelector, createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';
import { emptySelection, type SelectionCategory, type SelectionDocument } from './documentTypes';
import { selectionIds } from './identifiers';
import { normalizeSelectionDocument } from './documentClassification';
import { mergeSelections } from './documentMerge';
import { toggleSelectionIdentifier } from './documentOperations';

type SelectionState = {
    /** Derived from `document`, kept for cheap serializable reads. Only written through `setDocument`. */
    ids: string[];
    document: SelectionDocument;
    hydrated: boolean;
    storageAvailable: boolean;
};

const initialState: SelectionState = { ids: [], document: emptySelection(), hydrated: false, storageAvailable: true };

function setDocument(state: Draft<SelectionState>, document: SelectionDocument) {
    if (document === state.document) return;
    state.document = document;
    state.ids = selectionIds(document);
}

const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        hydrateSelection(state, action: PayloadAction<SelectionDocument>) {
            const document = normalizeSelectionDocument(action.payload);
            setDocument(state, document);
            state.hydrated = true;
        },
        toggleSelection(state, action: PayloadAction<{ id: string; category: SelectionCategory }>) {
            const { id, category } = action.payload;
            setDocument(state, toggleSelectionIdentifier(state.document, id, category));
        },
        addSelection(state, action: PayloadAction<SelectionDocument>) {
            const addition = normalizeSelectionDocument(action.payload);
            const merged = mergeSelections(state.document, addition);
            setDocument(state, merged);
        },
        clearSelection(state) { setDocument(state, emptySelection()); },
        setSelectionStorageAvailable(state, action: PayloadAction<boolean>) { state.storageAvailable = action.payload; },
    },
});

/** Memoized O(1) membership lookup shared by every SelectionButton. */
export const selectSelectedIdsByCategory = createSelector(
    [(state: { selection: SelectionState }) => state.selection.document],
    document => Object.fromEntries(Object.entries(document).map(([category, ids]) => [category, new Set(ids)])) as Record<SelectionCategory, Set<string>>,
);

export const { hydrateSelection, toggleSelection, addSelection, clearSelection, setSelectionStorageAvailable } = selectionSlice.actions;
export default selectionSlice.reducer;
