import { SELECTION_CATEGORIES, emptySelection, type SelectionCategory, type SelectionDocument } from './documentTypes';
import { selectionIds } from './identifiers';
import type { SelectionEntry } from './catalogue';

export type CatalogueIndex = ReadonlyMap<string, SelectionEntry>;

export function indexCatalogue(catalogue: readonly SelectionEntry[]): CatalogueIndex {
    const byId = new Map<string, SelectionEntry>();
    for (const entry of catalogue) {
        if (!byId.has(entry.selectionId)) byId.set(entry.selectionId, entry);
    }
    return byId;
}

// Build category-specific lookup sets once per resolution
function buildCategoryMatchers(document: SelectionDocument): Record<SelectionCategory, Set<string>> {
    return Object.fromEntries(
        SELECTION_CATEGORIES.map(category => [category, new Set(document[category])]),
    ) as Record<SelectionCategory, Set<string>>;
}

export function resolveSelectionCatalogue(
    catalogue: SelectionEntry[],
    document: SelectionDocument | null,
    byId: CatalogueIndex = indexCatalogue(catalogue),
) {
    if (document === null) {
        return { entries: [], unavailable: 0 };
    }

    const requested = selectionIds(document);
    const matchers = buildCategoryMatchers(document);

    const entries = requested
        .map(id => byId.get(id))
        .filter((entry): entry is SelectionEntry => !!entry && matchers[entry.category].has(entry.selectionId));

    return { entries, unavailable: requested.length - entries.length };
}

/** Inverse of resolution: the document that contains exactly these entries. */
export function selectionDocumentOf(entries: readonly SelectionEntry[]): SelectionDocument {
    const document = emptySelection();
    for (const entry of entries) document[entry.category].push(entry.selectionId);
    return document;
}

/** True when at least one entry is missing from `personal` (i.e. importing would change it). */
export function hasUnimportedEntries(entries: readonly SelectionEntry[], personal: SelectionDocument): boolean {
    const owned = buildCategoryMatchers(personal);
    return entries.some(entry => !owned[entry.category].has(entry.selectionId));
}