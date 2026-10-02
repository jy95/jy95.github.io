import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';

export function toSelectionId(category: SelectionCategory, id: string): string {
    return category === 'backlog' ? `backlog:${id}` : id;
}

/** Convert a normalized card identifier to its document representation. */
export function toDocumentId(id: string): string {
    return id.replace(/^backlog:/, '');
}

export function normalizeSelectionIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && /^(?:backlog:\d{1,128}|[A-Za-z0-9_-]{1,128})$/.test(id)))];
}
export function selectionIds(document: SelectionDocument): string[] {
    return normalizeSelectionIds(SELECTION_CATEGORIES.flatMap(category => document[category].map(id => toSelectionId(category, id))).concat(document.legacyIds ?? []));
}
