import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { SELECTION_CATEGORIES, classifySelection, emptySelection, normalizeSelectionIds, resolveLegacySelection, selectionIds, validateSelection, type SelectionCategories, type SelectionDocument } from './schema';
export { normalizeSelectionIds } from './schema';
// Retain the key so existing browsers and tabs migrate in place.
export const SELECTION_STORAGE_KEY = 'gamespassionfr.selection.v1';
export function parseStoredSelection(value: string | null): SelectionDocument | string[] {
    try {
        const parsed: unknown = JSON.parse(value ?? '[]');
        return Array.isArray(parsed) ? normalizeSelectionIds(parsed) : validateSelection(parsed);
    } catch { return []; }
}
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
            state.document = Array.isArray(action.payload) ? classifySelection(action.payload, state.categories) : resolveLegacySelection(validateSelection(action.payload), state.categories);
            state.ids = selectionIds(state.document);
            state.hydrated = true;
        },
        toggleSelection(state, action: PayloadAction<string>) {
            const id = action.payload;
            if (!normalizeSelectionIds([id]).length) return;
            if (state.ids.includes(id)) {
                for (const category of SELECTION_CATEGORIES) state.document[category] = state.document[category].filter(value => (category === 'backlog' ? `backlog:${value}` : value) !== id);
                if (state.document.legacyIds) state.document.legacyIds = state.document.legacyIds.filter(value => value !== id);
            } else {
                const addition = classifySelection([id], state.categories);
                for (const category of SELECTION_CATEGORIES) state.document[category].push(...addition[category]);
                if (addition.legacyIds) (state.document.legacyIds ??= []).push(...addition.legacyIds);
            }
            state.ids = selectionIds(state.document);
        },
        addSelection(state, action: PayloadAction<string[] | SelectionDocument>) {
            const addition = Array.isArray(action.payload) ? classifySelection(action.payload, state.categories) : resolveLegacySelection(validateSelection(action.payload), state.categories);
            for (const category of SELECTION_CATEGORIES) state.document[category] = [...new Set([...state.document[category], ...addition[category]])];
            const legacy = normalizeSelectionIds([...(state.document.legacyIds ?? []), ...(addition.legacyIds ?? [])]);
            if (legacy.length) state.document.legacyIds = legacy;
            state.ids = selectionIds(state.document);
        },
        clearSelection(state) { state.document = emptySelection(); state.ids = []; },
        setSelectionStorageAvailable(state, action: PayloadAction<boolean>) { state.storageAvailable = action.payload; },
    },
});
export const { hydrateSelection, toggleSelection, addSelection, clearSelection, setSelectionStorageAvailable, setSelectionCategories } = selectionSlice.actions;
export default selectionSlice.reducer;
