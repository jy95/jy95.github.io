import { SELECTION_CATEGORIES, emptySelection } from './documentTypes';
import { isBacklogId, isSelectionId, normalizeSelectionIds, selectionIds } from './identifiers';
import { mergeSelections } from './documentMerge';

import type { SelectionCategory, SelectionCategories, SelectionDocument } from './documentTypes';

function categoryForIdentifier(id: string, categories: SelectionCategories): SelectionCategory | undefined {
    return Object.hasOwn(categories, id) ? categories[id] : undefined;
}

export function classifySelection(ids: string[], categories: SelectionCategories = {}): SelectionDocument {
    const legacyIds: string[] = [];
    const document: SelectionDocument = { ...emptySelection(), legacyIds };
    for (const id of normalizeSelectionIds(ids)) {
        const category = categoryForIdentifier(id, categories);
        (category ? document[category] : legacyIds).push(id);
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

export function resolveSelectionInput(input: unknown, categories: SelectionCategories): SelectionDocument {
    if (Array.isArray(input)) return classifySelection(input, categories);
    return resolveLegacySelection(normalizeSelectionDocument(input), categories);
}

/** Keep usable fields without trusting incoming schema metadata. */
export function normalizeSelectionDocument(value: unknown): SelectionDocument {
    const document = emptySelection();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return document;
    const data = value as Record<string, unknown>;
    for (const category of SELECTION_CATEGORIES) {
        const ids = data[category];
        const valid = category === 'backlog' ? isBacklogId : isSelectionId;
        document[category] = Array.isArray(ids) ? [...new Set(ids.filter(valid))] : [];
    }
    if (Array.isArray(data.legacyIds)) document.legacyIds = normalizeSelectionIds(data.legacyIds);
    return document;
}
