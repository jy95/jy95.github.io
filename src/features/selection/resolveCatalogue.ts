import type { SelectionEntry } from './catalogue';
import type { SelectionDocument } from './documentTypes';

export function matchesSelectionCategory(entry: SelectionEntry, document: SelectionDocument): boolean {
    return document[entry.category].includes(entry.game.id) || Boolean(document.legacyIds?.includes(entry.selectionId));
}

export function resolveSelectionCatalogue(catalogue: SelectionEntry[], requested: string[], document: SelectionDocument | null = null) {
    const byId = new Map(catalogue.map(entry => [entry.selectionId, entry]));
    const selected: SelectionEntry[] = [];
    const seen = new Set<string>();

    for (const id of requested) {
        const entry = byId.get(id);
        if (!entry || seen.has(id)) continue;
        seen.add(id);

        if (document && !matchesSelectionCategory(entry, document)) continue;
        selected.push(entry);
    }

    return { entries: selected, unavailable: requested.length - selected.length, selectedIds: selected.map(entry => entry.selectionId) };
}
