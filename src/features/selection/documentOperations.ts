import type { SelectionCategories, SelectionDocument } from './documentTypes';
import { normalizeSelectionIds, selectionIds } from './identifiers';
import { classifySelection } from './documentClassification';
import { mergeSelections, removeSelectionIdentifier } from './documentMerge';

export { classifySelection, resolveLegacySelection, resolveSelectionInput } from './documentClassification';
export { mergeSelections, removeSelectionIdentifier } from './documentMerge';

export function toggleSelectionIdentifier(document: SelectionDocument, id: string, categories: SelectionCategories): SelectionDocument {
    if (!normalizeSelectionIds([id]).length) return document;
    if (selectionIds(document).includes(id)) return removeSelectionIdentifier(document, id);
    return mergeSelections(document, classifySelection([id], categories));
}