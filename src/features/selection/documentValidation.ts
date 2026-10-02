import { SELECTION_CATEGORIES, emptySelection, type SelectionDocument } from './documentTypes';
import { isBacklogId, isCardId, isSelectionId } from './identifiers';

const ALLOWED_KEYS: ReadonlySet<string> = new Set(['version', ...SELECTION_CATEGORIES, 'legacyIds']);

export function validateIdentifiers(value: unknown, valid: (id: unknown) => boolean): string[] {
    if (!Array.isArray(value) || !value.every(valid)) throw new Error('invalid');
    return [...new Set(value)] as string[];
}

/** Strict shared/storage schema validation; duplicate identifiers are normalized. */
export function validateSelection(value: unknown): SelectionDocument {
    const data = validateDocumentHeader(value);
    const document = emptySelection();
    for (const category of SELECTION_CATEGORIES) {
        document[category] = validateIdentifiers(data[category], category === 'backlog' ? isBacklogId : isCardId);
    }
    if (data.legacyIds !== undefined) {
        document.legacyIds = validateIdentifiers(data.legacyIds, isSelectionId);
    }
    return document;
}

function validateDocumentHeader(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid');
    const data = value as Record<string, unknown>;
    if (typeof data.version !== 'number') throw new Error('invalid');
    if (data.version !== 2) throw new Error('unsupported');
    if (Object.keys(data).some(key => !ALLOWED_KEYS.has(key))) throw new Error('invalid');
    return data;
}