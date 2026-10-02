import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const SELECTION_STORAGE_KEY = 'gamespassionfr.selection.v1';

/** Only catalogue identifiers are persisted, never game metadata. */
export function normalizeSelectionIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string =>
        typeof id === 'string' && /^(?:backlog:\d+|[A-Za-z0-9_-]{1,128})$/.test(id)))];
}

export function parseStoredSelection(value: string | null): string[] {
    try {
        return normalizeSelectionIds(JSON.parse(value ?? '[]'));
    } catch {
        return [];
    }
}

const selectionSlice = createSlice({
    name: 'selection',
    initialState: { ids: [] as string[], hydrated: false, storageAvailable: true },
    reducers: {
        hydrateSelection(state, action: PayloadAction<string[]>) {
            state.ids = normalizeSelectionIds(action.payload);
            state.hydrated = true;
        },
        toggleSelection(state, action: PayloadAction<string>) {
            const id = action.payload;
            if (!normalizeSelectionIds([id]).length) return;
            state.ids = state.ids.includes(id) ? state.ids.filter(value => value !== id) : [...state.ids, id];
        },
        addSelection(state, action: PayloadAction<string[]>) {
            state.ids = normalizeSelectionIds([...state.ids, ...action.payload]);
        },
        clearSelection(state) { state.ids = []; },
        setSelectionStorageAvailable(state, action: PayloadAction<boolean>) {
            state.storageAvailable = action.payload;
        },
    },
});

export const { hydrateSelection, toggleSelection, addSelection, clearSelection, setSelectionStorageAvailable } = selectionSlice.actions;
export default selectionSlice.reducer;
