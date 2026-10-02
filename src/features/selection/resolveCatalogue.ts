import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';
import type { SelectionEntry } from './catalogue';

export type CatalogueIndex = ReadonlyMap<string, SelectionEntry>;

export const indexCatalogue = (catalogue: readonly SelectionEntry[]): CatalogueIndex =>
    new Map(catalogue.map(entry => [entry.selectionId, entry]));

/** Builds Set-based lookups once so matching many entries stays linear. */
function categoryMatcher(document: SelectionDocument) {
    const byCategory = Object.fromEntries(
        SELECTION_CATEGORIES.map(category => [category, new Set(document[category])])
    ) as Record<SelectionCategory, Set<string>>;
    const legacy = new Set(document.legacyIds);
    return (entry: SelectionEntry) => byCategory[entry.category].has(entry.game.id) || legacy.has(entry.selectionId);
}

export function resolveSelectionCatalogue(
    catalogue: SelectionEntry[],
    requested: string[],
    document: SelectionDocument | null = null,
    byId: CatalogueIndex = indexCatalogue(catalogue),
) {
    const matches = document ? categoryMatcher(document) : null;
    const entries = requested.flatMap(id => {
        const entry = byId.get(id);
        return entry && (!matches || matches(entry)) ? [entry] : [];
    });
    return { entries, unavailable: requested.length - entries.length, selectedIds: entries.map(entry => entry.selectionId) };
}
