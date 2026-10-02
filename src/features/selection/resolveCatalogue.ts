import type { SelectionEntry } from './catalogue';
import type { SelectionDocument } from './documentTypes';

export function matchesSelectionCategory(entry: SelectionEntry, document: SelectionDocument): boolean {
    return document[entry.category].includes(entry.game.id) || Boolean(document.legacyIds?.includes(entry.selectionId));
}

export function resolveSelectionCatalogue(catalogue: SelectionEntry[], requested: string[], document: SelectionDocument | null = null) {
    const byId = new Map(catalogue.map(entry => [entry.selectionId, entry]));
    const entries = requested.flatMap(id => {
        const entry = byId.get(id);
        if (!entry) return [];
        if (document && !matchesSelectionCategory(entry, document)) return [];
        return [entry];
    });
    return { entries, unavailable: requested.length - entries.length, selectedIds: entries.map(entry => entry.selectionId) };
}
