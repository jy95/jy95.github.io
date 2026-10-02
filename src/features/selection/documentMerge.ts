import { SELECTION_CATEGORIES, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds } from './identifiers';

type SelectionCategory = (typeof SELECTION_CATEGORIES)[number];

function updateCategories(
    document: SelectionDocument,
    update: (values: string[], category: SelectionCategory) => string[],
): SelectionDocument {
    return {
        ...document,
        ...Object.fromEntries(
            SELECTION_CATEGORIES.map(category => [
                category,
                update(document[category], category),
            ]),
        ),
    };
}

function mergeIds(first: string[], second: string[]): string[] {
    return [...new Set([...first, ...second])];
}

function removeId(values: string[], id: string): string[] {
    return values.filter(value => value !== id);
}

export function mergeSelections(
    document: SelectionDocument,
    addition: SelectionDocument,
): SelectionDocument {
    const merged = updateCategories(document, (_, category) =>
        mergeIds(document[category], addition[category]),
    );

    const legacyIds = normalizeSelectionIds(
        mergeIds(document.legacyIds ?? [], addition.legacyIds ?? []),
    );

    return legacyIds.length
        ? { ...merged, legacyIds }
        : merged;
}

export function removeSelectionIdentifier(
    document: SelectionDocument,
    id: string,
): SelectionDocument {
    const result = updateCategories(document, values => removeId(values, id));

    return document.legacyIds
        ? { ...result, legacyIds: removeId(document.legacyIds, id) }
        : result;
}