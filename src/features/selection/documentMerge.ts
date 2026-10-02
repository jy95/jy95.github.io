import { SELECTION_CATEGORIES, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds } from './identifiers';

export function mergeSelections(document: SelectionDocument, addition: SelectionDocument): SelectionDocument {
    const merged = { ...document };
    for (const category of SELECTION_CATEGORIES) {
        const combined = [...document[category], ...addition[category]];
        merged[category] = [...new Set(combined)];
    }
    const combinedLegacyIds = [...(document.legacyIds ?? []), ...(addition.legacyIds ?? [])];
    const legacy = normalizeSelectionIds(combinedLegacyIds);
    if (legacy.length) merged.legacyIds = legacy;
    return merged;
}

export function removeSelectionIdentifier(document: SelectionDocument, id: string): SelectionDocument {
    const removed = { ...document };
    for (const category of SELECTION_CATEGORIES) {
        removed[category] = document[category].filter(value => value !== id);
    }
    if (document.legacyIds) {
        removed.legacyIds = document.legacyIds.filter(value => value !== id);
    }
    return removed;
}
