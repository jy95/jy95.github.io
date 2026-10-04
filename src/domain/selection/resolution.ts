import { SELECTION_CATEGORIES } from "./categories";

import type { SelectionDocument, SelectionEntry, SelectionIdentifier } from "./types";

type ResolvedSelection = {
    document: SelectionDocument;
    entries: SelectionEntry[];
    missing: SelectionIdentifier[];
};

/**
 * Resolves a SelectionDocument against the catalogue.
 * 
 * - Preserves the original `SelectionDocument` as the source of truth.
 * - Map-indexes catalogue entries for O(1) lookups.
 * - Visits categories and IDs in document order, preserving resolved and missing order.
 */
export function resolveSelection(catalogue: readonly SelectionEntry[], document: SelectionDocument): ResolvedSelection {

    // O(1) index lookup by composite key "category:selectionId"
    const byKey = new Map(
        catalogue.map(entry => [`${entry.category}:${entry.selectionId}`, entry])
    );

    const entries: SelectionEntry[] = [];
    const missing: SelectionIdentifier[] = [];
    for (const category of SELECTION_CATEGORIES) {
        for (const id of document[category]) {
            const entry = byKey.get(`${category}:${id}`);
            if (entry) entries.push(entry);
            else missing.push({ category, selectionId: id });
        }
    }

    return { document, entries, missing };
}
