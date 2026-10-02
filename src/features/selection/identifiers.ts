import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';

const BACKLOG_ID = /^\d{1,128}$/;
const CARD_ID = /^[A-Za-z0-9_-]{1,128}$/;

export const isBacklogId = (id: unknown): id is string => typeof id === 'string' && BACKLOG_ID.test(id);
export const isCardId = (id: unknown): id is string => typeof id === 'string' && CARD_ID.test(id);
export const isSelectionId = (id: unknown): id is string =>
    isCardId(id) || (typeof id === 'string' && id.startsWith('backlog:') && isBacklogId(id.slice('backlog:'.length)));

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