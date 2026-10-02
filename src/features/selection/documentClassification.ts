import { SELECTION_CATEGORIES, emptySelection } from './documentTypes';
import { normalizeSelectionIds, selectionIds } from './identifiers';
import { mergeSelections } from './documentMerge';

import type { SelectionCategories, SelectionDocument } from './documentTypes';

export function classifySelection(
    ids: string[],
    categories: SelectionCategories = {},
): SelectionDocument {
    const document = emptySelection();
    const legacyIds: string[] = [];

    for (const id of normalizeSelectionIds(ids)) {
        const category = categories[id];

        if (category) {
            document[category].push(id);
        } else {
            legacyIds.push(id);
        }
    }

    if (legacyIds.length) document.legacyIds = legacyIds;

    return document;
}

export function resolveLegacySelection(
    document: SelectionDocument,
    categories: SelectionCategories,
): SelectionDocument {
    if (!document.legacyIds?.length) {
        if (!document.legacyIds) return document;

        const { legacyIds: _, ...resolved } = document;
        return resolved;
    }

    const explicitIds = new Set(selectionIds({ ...document, legacyIds: [] }));
    const migrated = classifySelection(
        document.legacyIds.filter(id => !explicitIds.has(id)),
        categories,
    );

    const resolved = mergeSelections(document, migrated);

    if (migrated.legacyIds) {
        resolved.legacyIds = migrated.legacyIds;
    } else {
        delete resolved.legacyIds;
    }

    return resolved;
}

export function resolveSelectionInput(
    input: unknown,
    categories: SelectionCategories,
): SelectionDocument {
    return Array.isArray(input)
        ? classifySelection(input, categories)
        : resolveLegacySelection(normalizeSelectionDocument(input), categories);
}

/** Keep usable fields without trusting incoming schema metadata. */
export function normalizeSelectionDocument(value: unknown): SelectionDocument {
    const document = emptySelection();

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return document;
    }

    const data = value as Record<string, unknown>;

    for (const category of SELECTION_CATEGORIES) {
        document[category] = normalizeSelectionIds(data[category]);
    }

    if (Array.isArray(data.legacyIds)) {
        document.legacyIds = normalizeSelectionIds(data.legacyIds);
    }

    return document;
}