import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { emptySelection, resolveLegacySelection, selectionIds, type SelectionCategories, type SelectionDocument } from './schema';
export { normalizeSelectionIds } from './identifiers';
export { parseStoredSelection, SELECTION_STORAGE_KEY } from './storageFormat';
import { mergeSelections, resolveSelectionInput, toggleSelectionIdentifier } from './documentOperations';
const selectionSlice = createSlice({
    name: 'selection',
    initialState: { ids: [] as string[], document: emptySelection(), categories: {} as SelectionCategories, hydrated: false, storageAvailable: true },
    reducers: {
        setSelectionCategories(state, action: PayloadAction<SelectionCategories>) {
            state.categories = action.payload;
            state.document = resolveLegacySelection(state.document, action.payload);
            state.ids = selectionIds(state.document);
        },
        hydrateSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            state.document = resolveSelectionInput(action.payload, state.categories);
            state.ids = selectionIds(state.document);
            state.hydrated = true;
        },
        toggleSelection(state, action: PayloadAction<string>) {
            state.document = toggleSelectionIdentifier(state.document, action.payload, state.categories);
            state.ids = selectionIds(state.document);
        },
        addSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            state.document = mergeSelections(state.document, resolveSelectionInput(action.payload, state.categories));
            state.ids = selectionIds(state.document);
        },
        clearSelection(state) { state.document = emptySelection(); state.ids = []; },
        setSelectionStorageAvailable(state, action: PayloadAction<boolean>) { state.storageAvailable = action.payload; },
    },
});
export const { hydrateSelection, toggleSelection, addSelection, clearSelection, setSelectionStorageAvailable, setSelectionCategories } = selectionSlice.actions;
export default selectionSlice.reducer;
