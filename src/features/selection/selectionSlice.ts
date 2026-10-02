import { createSelector, createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';
import { emptySelection, type SelectionCategories, type SelectionDocument } from './documentTypes';
import { selectionIds } from './identifiers';
import { resolveLegacySelection, resolveSelectionInput } from './documentClassification';
import { mergeSelections } from './documentMerge';
import { toggleSelectionIdentifier } from './documentOperations';

type SelectionState = {
    /** Derived from `document`, kept for cheap serializable reads. Only written through `setDocument`. */
    ids: string[];
    document: SelectionDocument;
    categories: SelectionCategories;
    hydrated: boolean;
    storageAvailable: boolean;
};

const initialState: SelectionState = { ids: [], document: emptySelection(), categories: {}, hydrated: false, storageAvailable: true };

function setDocument(state: Draft<SelectionState>, document: SelectionDocument) {
    state.document = document;
    state.ids = selectionIds(document);
}

const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        setSelectionCategories(state, action: PayloadAction<SelectionCategories>) {
            state.categories = action.payload;
            const resolved = resolveLegacySelection(state.document, action.payload);
            // No-op (and no localStorage write) when nothing was resolved.
            if (resolved !== state.document) setDocument(state, resolved);
        },
        hydrateSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            setDocument(state, resolveSelectionInput(action.payload, state.categories));
            state.hydrated = true;
        },
        toggleSelection(state, action: PayloadAction<string>) {
            setDocument(state, toggleSelectionIdentifier(state.document, action.payload, state.categories));
        },
        addSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            setDocument(state, mergeSelections(state.document, resolveSelectionInput(action.payload, state.categories)));
        },
        clearSelection(state) { setDocument(state, emptySelection()); },
        setSelectionStorageAvailable(state, action: PayloadAction<boolean>) { state.storageAvailable = action.payload; },
    },
});

/** Memoized O(1) membership lookup shared by every SelectionButton. */
export const selectSelectedIdSet = createSelector(
    [(state: { selection: SelectionState }) => state.selection.ids],
    ids => new Set(ids),
);

export const { hydrateSelection, toggleSelection, addSelection, clearSelection, setSelectionStorageAvailable, setSelectionCategories } = selectionSlice.actions;
export default selectionSlice.reducer;
