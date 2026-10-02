import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';
import type { SelectionEntry } from './catalogue';

export type CatalogueIndex = ReadonlyMap<string, SelectionEntry>;

export function indexCatalogue(catalogue: readonly SelectionEntry[]): CatalogueIndex {
    return new Map(catalogue.map(entry => [entry.selectionId, entry]));
}

function categoryMatcher(document: SelectionDocument) {
    const byCategory = Object.fromEntries(
        SELECTION_CATEGORIES.map(category => [category, new Set(document[category])])
    ) as Record<SelectionCategory, Set<string>>;

    const explicit = new Set(SELECTION_CATEGORIES.flatMap(category => document[category]));
    const legacy = new Set(document.legacyIds?.filter(id => !explicit.has(id)));

    return (entry: SelectionEntry) =>
        byCategory[entry.category].has(entry.game.id) ||
        legacy.has(entry.selectionId);
}

export function resolveSelectionCatalogue(
    catalogue: SelectionEntry[],
    requested: string[],
    document: SelectionDocument | null = null,
    byId: CatalogueIndex = indexCatalogue(catalogue),
) {
    const matches = document ? categoryMatcher(document) : () => true;
    const entries = requested
        .map(id => byId.get(id))
        .filter((entry): entry is SelectionEntry => !!entry && matches(entry));

    return {
        entries,
        unavailable: requested.length - entries.length,
        selectedIds: entries.map(entry => entry.selectionId),
    };
}