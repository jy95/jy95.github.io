import { SELECTION_CATEGORIES, emptySelection, type SelectionDocument } from './documentTypes';
import { normalizeSelectionIds } from './identifiers';

export function validateIdentifiers(value: unknown, valid: (id: unknown) => boolean): string[] {
    if (!Array.isArray(value) || !value.every(valid)) throw new Error('invalid');
    return [...new Set(value)] as string[];
}

/** Strict shared/storage schema validation; duplicate identifiers are normalized. */
export function validateSelection(value: unknown): SelectionDocument {
    const data = validateDocumentHeader(value);
    const document = emptySelection();
    for (const category of SELECTION_CATEGORIES) {
        const ids = data[category];
        const pattern = category === 'backlog' ? /^\d{1,128}$/ : /^[A-Za-z0-9_-]{1,128}$/;
        document[category] = validateIdentifiers(ids, id => typeof id === 'string' && pattern.test(id));
    }
    if (data.legacyIds !== undefined) {
        document.legacyIds = validateIdentifiers(data.legacyIds, id => normalizeSelectionIds([id]).length === 1);
    }
    return document;
}


function validateDocumentHeader(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid');
    const data = value as Record<string, unknown>;
    if (typeof data.version !== 'number') throw new Error('invalid');
    if (data.version !== 2) throw new Error('unsupported');
    if (Object.keys(data).some(key => !['version', ...SELECTION_CATEGORIES, 'legacyIds'].includes(key))) throw new Error('invalid');
    return data;
}
