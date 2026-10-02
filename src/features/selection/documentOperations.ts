import type { SelectionCategories, SelectionDocument } from './documentTypes';
import { selectionIds } from './identifiers';
import { classifySelection } from './documentClassification';
import { mergeSelections, removeSelectionIdentifier } from './documentMerge';

export function toggleSelectionIdentifier(document: SelectionDocument, id: string, categories: SelectionCategories): SelectionDocument {
    if (selectionIds(document).includes(id)) return removeSelectionIdentifier(document, id);
    return mergeSelections(document, classifySelection([id], categories));
}
