import { emptySelection } from "./operations";
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
 * - Flattens category-grouped IDs into a unified identifier stream.
 * - Partitions items into matched `entries` and unmatched `missing` identifiers via `reduce`.
 */
export function resolveSelection(catalogue: readonly SelectionEntry[], document: SelectionDocument | null): ResolvedSelection {

    if (!document) {
        return {
            document: emptySelection(),
            entries: [],
            missing: []
        }
    }

    // O(1) index lookup by composite key "category:selectionId"
    const byKey = new Map(
        catalogue.map(entry => [`${entry.category}:${entry.selectionId}`, entry])
    );

    // Flatten the multi-category structure into a single stream of identifiers
    const identifiers = SELECTION_CATEGORIES.flatMap(category =>
        document[category].map(id => ({ category, id }))
    );

    // Partition identifiers into resolved catalog entries vs missing references in one pass
    const { entries, missing } = identifiers.reduce<{
        entries: SelectionEntry[];
        missing: SelectionIdentifier[];
    }>(
        (acc, { category, id }) => {
            const entry = byKey.get(`${category}:${id}`);

            if (entry) {
                acc.entries.push(entry);
            } else {
                acc.missing.push({ category, selectionId: id });
            }

            return acc;
        },
        { entries: [], missing: [] }
    );


    return { document, entries, missing };
}