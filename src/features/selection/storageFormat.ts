import { normalizeSelectionDocument } from './documentClassification';
import { emptySelection, type SelectionDocument } from './documentTypes';

// Retain the existing browser storage key.
export const SELECTION_STORAGE_KEY = 'gamespassionfr.selection.v1';
export function parseStoredSelection(value: string | null): SelectionDocument {
    try {
        const parsed: unknown = JSON.parse(value ?? 'null');
        return normalizeSelectionDocument(parsed);
    } catch { return emptySelection(); }
}
