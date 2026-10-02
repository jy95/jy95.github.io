import { SELECTION_CATEGORIES, type SelectionDocument } from './documentTypes';

const BACKLOG_ID = /^\d{1,128}$/;
const CARD_ID = /^[A-Za-z0-9_-]{1,128}$/;

export const isBacklogId = (id: unknown): id is string => typeof id === 'string' && BACKLOG_ID.test(id);
export const isSelectionId = (id: unknown): id is string => typeof id === 'string' && CARD_ID.test(id);

export function normalizeSelectionIds(value: unknown): string[] {
    return Array.isArray(value) ? [...new Set(value.filter(isSelectionId))] : [];
}

export function selectionIds(document: SelectionDocument): string[] {
    return normalizeSelectionIds(
        SELECTION_CATEGORIES
            .flatMap(category => document[category])
            .concat(document.legacyIds ?? [])
    );
}