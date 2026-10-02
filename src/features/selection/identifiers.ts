import { SELECTION_CATEGORIES, type SelectionDocument } from './documentTypes';

export function normalizeSelectionIds(value: unknown): string[] {
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))] : [];
}

export function selectionIds(document: SelectionDocument): string[] {
    return normalizeSelectionIds(
        SELECTION_CATEGORIES
            .flatMap(category => document[category])
            .concat(document.legacyIds ?? [])
    );
}
