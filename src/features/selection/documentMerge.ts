import { SELECTION_CATEGORIES, emptySelection, type SelectionDocument } from './documentTypes';

export function mergeSelections(document: SelectionDocument, addition: SelectionDocument): SelectionDocument {
    const merged = emptySelection();
    for (const category of SELECTION_CATEGORIES) {
        merged[category] = [...new Set([...document[category], ...addition[category]])];
    }
    return merged;
}
