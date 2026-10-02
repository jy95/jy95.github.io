import { SELECTION_CATEGORIES, type SelectionCategory, type SelectionDocument } from './documentTypes';

const BACKLOG_PREFIX = 'backlog:';
const VALID_SELECTION_ID_PATTERN = /^(?:backlog:\d{1,128}|[A-Za-z0-9_-]{1,128})$/;

export function toSelectionId(category: SelectionCategory, id: string): string {
    return category === 'backlog' ? `${BACKLOG_PREFIX}${id}` : id;
}

/** Convert a normalized card identifier to its document representation. */
export function toDocumentId(id: string): string {
    return id.startsWith(BACKLOG_PREFIX) ? id.slice(BACKLOG_PREFIX.length) : id;
}

export function normalizeSelectionIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    const normalized = new Set<string>();
    for (const id of value) {
        if (typeof id === 'string' && VALID_SELECTION_ID_PATTERN.test(id)) normalized.add(id);
    }
    return [...normalized];
}

export function selectionIds(document: SelectionDocument): string[] {
    const ids = new Set<string>();

    for (const category of SELECTION_CATEGORIES) {
        for (const id of document[category]) {
            ids.add(toSelectionId(category, id));
        }
    }

    if (document.legacyIds) {
        for (const id of document.legacyIds) {
            ids.add(id);
        }
    }

    return normalizeSelectionIds([...ids]);
}
