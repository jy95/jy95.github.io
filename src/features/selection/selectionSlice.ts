import { createSelector, createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';
import { emptySelection, type SelectionCategory, type SelectionCategories, type SelectionDocument } from './documentTypes';
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
    if (document === state.document) return;
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
            setDocument(state, resolved);
        },
        hydrateSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            const document = resolveSelectionInput(action.payload, state.categories);
            setDocument(state, document);
            state.hydrated = true;
        },
        toggleSelection(state, action: PayloadAction<string | { id: string; category: SelectionCategory }>) {
            const { id, category } = typeof action.payload === 'string' ? { id: action.payload, category: undefined } : action.payload;
            const categories = category ? { ...state.categories, [id]: category } : state.categories;
            const document = toggleSelectionIdentifier(state.document, id, categories);
            setDocument(state, document);
        },
        addSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            const addition = resolveSelectionInput(action.payload, state.categories);
            const merged = mergeSelections(state.document, addition);
            setDocument(state, merged);
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
