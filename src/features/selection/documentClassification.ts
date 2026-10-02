import { SELECTION_CATEGORIES, emptySelection, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds } from './identifiers';

/** Keep only category arrays, ignoring incoming metadata and unknown fields. */
export function normalizeSelectionDocument(value: unknown): SelectionDocument {
    const document = emptySelection();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return document;
    const data = value as Record<string, unknown>;
    for (const category of SELECTION_CATEGORIES) {
        document[category] = normalizeSelectionIds(data[category]);
    }
    return document;
}
