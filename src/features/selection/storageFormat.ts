import { normalizeSelectionIds } from './identifiers';
import { validateSelection } from './documentValidation';
import type { SelectionDocument } from './documentTypes';

// Retain the key so existing browsers and tabs migrate in place.
export const SELECTION_STORAGE_KEY = 'gamespassionfr.selection.v1';
export function parseStoredSelection(value: string | null): SelectionDocument | string[] {
    try {
        const parsed: unknown = JSON.parse(value ?? '[]');
        return Array.isArray(parsed) ? normalizeSelectionIds(parsed) : validateSelection(parsed);
    } catch { return []; }
}
