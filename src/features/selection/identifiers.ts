import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';

const SELECTION_ID = /^(?:backlog:\d{1,128}|[A-Za-z0-9_-]{1,128})$/;

export const isSelectionId = (id: unknown): id is string => typeof id === 'string' && SELECTION_ID.test(id);

export function toSelectionId(category: SelectionCategory, id: string): string {
    return category === 'backlog' ? `backlog:${id}` : id;
}

/** Convert a normalized card identifier to its document representation. */
export function toDocumentId(id: string): string {
    return id.replace(/^backlog:/, '');
}

export function normalizeSelectionIds(value: unknown): string[] {
    return Array.isArray(value) ? [...new Set(value.filter(isSelectionId))] : [];
}

export function selectionIds(document: SelectionDocument): string[] {
    return normalizeSelectionIds(
        SELECTION_CATEGORIES
            .flatMap(category => document[category].map(id => toSelectionId(category, id)))
            .concat(document.legacyIds ?? [])
    );
}