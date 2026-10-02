import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';
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

function categoryMatcher(document: SelectionDocument) {
    const byCategory = Object.fromEntries(
        SELECTION_CATEGORIES.map(category => [category, new Set(document[category])])
    ) as Record<SelectionCategory, Set<string>>;

    return (entry: SelectionEntry) => byCategory[entry.category].has(entry.game.id);
}

export function resolveSelectionCatalogue(
    catalogue: SelectionEntry[],
    document: SelectionDocument | null,
    byId: CatalogueIndex = indexCatalogue(catalogue),
) {
    const requested = document ? selectionIds(document) : [];
    const matches = document ? categoryMatcher(document) : () => false;
    const entries = requested
        .map(id => byId.get(id))
        .filter((entry): entry is SelectionEntry => !!entry && matches(entry));

    return {
        entries,
        unavailable: requested.length - entries.length,
    };
}
