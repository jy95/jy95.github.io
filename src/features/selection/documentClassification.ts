import { emptySelection } from './documentTypes';
import { normalizeSelectionIds, selectionIds, toDocumentId } from './identifiers';
import { validateSelection } from './documentValidation';
import { mergeSelections } from './documentMerge';

import type { SelectionCategory, SelectionCategories, SelectionDocument } from './documentTypes';

function categoryForIdentifier(id: string, categories: SelectionCategories): SelectionCategory | undefined {
    if (id.startsWith('backlog:')) return 'backlog';
    return Object.hasOwn(categories, id) ? categories[id] : undefined;
}

export function classifySelection(ids: string[], categories: SelectionCategories = {}): SelectionDocument {
    const legacyIds: string[] = [];
    const document: SelectionDocument = { ...emptySelection(), legacyIds };
    for (const id of normalizeSelectionIds(ids)) {
        const category = categoryForIdentifier(id, categories);
        (category ? document[category] : legacyIds).push(toDocumentId(id));
    }
    if (!legacyIds.length) delete document.legacyIds;
    return document;
}

/**
 * Resolve only legacy IDs; explicit versioned categories remain authoritative.
 * Returns the *same* document when there is nothing to resolve, so callers can
 * cheaply detect "no change" by reference.
 */
export function resolveLegacySelection(document: SelectionDocument, categories: SelectionCategories): SelectionDocument {
    if (!document.legacyIds?.length) {
        if (!document.legacyIds) return document;
        const { legacyIds: _empty, ...withoutLegacy } = document;
        return withoutLegacy;
    }
    const explicitIds = new Set(selectionIds({ ...document, legacyIds: [] }));
    const migrated = classifySelection(document.legacyIds.filter(id => !explicitIds.has(id)), categories);
    const resolved = mergeSelections(document, migrated);
    delete resolved.legacyIds;
    if (migrated.legacyIds) resolved.legacyIds = migrated.legacyIds;
    return resolved;
}

export function resolveSelectionInput(input: string[] | SelectionDocument, categories: SelectionCategories): SelectionDocument {
    if (Array.isArray(input)) return classifySelection(input, categories);
    return resolveLegacySelection(validateSelection(input), categories);
}