import { SELECTION_CATEGORIES } from './categories';
import type { SelectionDocument } from './types';

export function isSelectionDocument(value: unknown): value is SelectionDocument {
    if (typeof value !== 'object' || value === null) return false;

    const source = value as Record<string, unknown>;
    return SELECTION_CATEGORIES.every(category =>
        Array.isArray(source[category]) &&
        source[category].every(id => typeof id === 'string')
    );
}
