import { SELECTION_CATEGORIES, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds, toSelectionId } from './identifiers';

export function mergeSelections(document: SelectionDocument, addition: SelectionDocument): SelectionDocument {
    const merged = { ...document };
    for (const category of SELECTION_CATEGORIES) merged[category] = [...new Set([...document[category], ...addition[category]])];
    const legacy = normalizeSelectionIds([...(document.legacyIds ?? []), ...(addition.legacyIds ?? [])]);
    if (legacy.length) merged.legacyIds = legacy;
    return merged;
}

export function removeSelectionIdentifier(document: SelectionDocument, id: string): SelectionDocument {
    const removed = { ...document };
    for (const category of SELECTION_CATEGORIES) removed[category] = document[category].filter(value => toSelectionId(category, value) !== id);
    if (document.legacyIds) removed.legacyIds = document.legacyIds.filter(value => value !== id);
    return removed;
}