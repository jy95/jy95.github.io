import { emptySelection, type SelectionCategory, type SelectionCategories, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds, selectionIds, toDocumentId } from './identifiers';
import { validateSelection } from './documentValidation';
import { mergeSelections } from './documentOperations';

function categoryForIdentifier(id: string, categories: SelectionCategories): SelectionCategory | undefined {
    if (id.startsWith('backlog:')) return 'backlog';
    if (Object.hasOwn(categories, id)) return categories[id];
    return undefined;
}

export function classifySelection(ids: string[], categories: SelectionCategories = {}): SelectionDocument {
    const legacyIds: string[] = [];
    const document: SelectionDocument = { ...emptySelection(), legacyIds };
    for (const id of normalizeSelectionIds(ids)) {
        const category = categoryForIdentifier(id, categories);
        const target = category ? document[category] : legacyIds;
        target.push(toDocumentId(id));
    }
    if (!legacyIds.length) delete document.legacyIds;
    return document;
}
/** Resolve only legacy IDs; explicit versioned categories remain authoritative. */
export function resolveLegacySelection(document: SelectionDocument, categories: SelectionCategories): SelectionDocument {
    const explicitIds = new Set(selectionIds({ ...document, legacyIds: [] }));
    const migrated = classifySelection((document.legacyIds ?? []).filter(id => !explicitIds.has(id)), categories);
    const resolved = mergeSelections(document, migrated);
    delete resolved.legacyIds;
    if (migrated.legacyIds) resolved.legacyIds = migrated.legacyIds;
    return resolved;
}

export function resolveSelectionInput(input: string[] | SelectionDocument, categories: SelectionCategories): SelectionDocument {
    if (Array.isArray(input)) return classifySelection(input, categories);
    return resolveLegacySelection(validateSelection(input), categories);
}

