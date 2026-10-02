import { SELECTION_CATEGORIES, emptySelection, type SelectionCategory, type SelectionCategories, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds, selectionIds, toSelectionId } from './identifiers';
import { validateSelection } from './documentValidation';

function categoryForIdentifier(id: string, categories: SelectionCategories): SelectionCategory | undefined {
    if (id.startsWith('backlog:')) return 'backlog';
    if (Object.hasOwn(categories, id)) return categories[id];
    return undefined;
}

export function classifySelection(ids: string[], categories: SelectionCategories = {}): SelectionDocument {
    const document = emptySelection();
    for (const id of normalizeSelectionIds(ids)) {
        const category = categoryForIdentifier(id, categories);
        if (category) document[category].push(category === 'backlog' ? id.slice(8) : id);
        else {
            document.legacyIds ??= [];
            document.legacyIds.push(id);
        }
    }
    return document;
}
export function mergeSelections(document: SelectionDocument, addition: SelectionDocument): SelectionDocument {
    const merged = { ...document };
    for (const category of SELECTION_CATEGORIES) merged[category] = [...new Set([...document[category], ...addition[category]])];
    const legacy = normalizeSelectionIds([...(document.legacyIds ?? []), ...(addition.legacyIds ?? [])]);
    if (legacy.length) merged.legacyIds = legacy;
    return merged;
}

/** Resolve only legacy IDs; explicit versioned categories remain authoritative. */
export function resolveLegacySelection(document: SelectionDocument, categories: SelectionCategories): SelectionDocument {
    const migrated = classifySelection(document.legacyIds ?? [], categories);
    const resolved = mergeSelections(document, migrated);
    if (migrated.legacyIds?.length) resolved.legacyIds = migrated.legacyIds;
    else delete resolved.legacyIds;
    return resolved;
}

export function resolveSelectionInput(input: string[] | SelectionDocument, categories: SelectionCategories): SelectionDocument {
    if (Array.isArray(input)) return classifySelection(input, categories);
    return resolveLegacySelection(validateSelection(input), categories);
}

export function removeSelectionIdentifier(document: SelectionDocument, id: string): SelectionDocument {
    const removed = { ...document };
    for (const category of SELECTION_CATEGORIES) removed[category] = document[category].filter(value => toSelectionId(category, value) !== id);
    if (document.legacyIds) removed.legacyIds = document.legacyIds.filter(value => value !== id);
    return removed;
}

export function toggleSelectionIdentifier(document: SelectionDocument, id: string, categories: SelectionCategories): SelectionDocument {
    if (!normalizeSelectionIds([id]).length) return document;
    if (selectionIds(document).includes(id)) return removeSelectionIdentifier(document, id);
    return mergeSelections(document, classifySelection([id], categories));
}
