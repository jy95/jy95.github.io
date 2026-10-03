import { SELECTION_CATEGORIES } from "./categories";
import type { SelectionDocument, SelectionCategory } from './types';

// Reusable code
const unique = (ids: string[]) => [...new Set(ids)];
const isString = (value: unknown): value is string => typeof value === 'string';
const build = (ids: (category: SelectionCategory) => string[]) =>
    Object.fromEntries(SELECTION_CATEGORIES.map(category => [category, ids(category)])) as SelectionDocument;

// Operations
export const emptySelection = (): SelectionDocument => build(() => []);

export const isEmpty = (document: SelectionDocument) =>
    SELECTION_CATEGORIES.every(category => document[category].length === 0);

export function toSelectionDocument(value: unknown): SelectionDocument {
    const source = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
    return build(category => {
        const ids = source[category];
        return Array.isArray(ids) ? unique(ids.filter(isString)) : [];
    });
}

export const mergeSelections = (a: SelectionDocument, b: SelectionDocument) =>
    build(category => unique([...a[category], ...b[category]]));

export function toggleId(document: SelectionDocument, category: SelectionCategory, id: string) {
    const ids = document[category];
    return { ...document, [category]: ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id] };
}

export const hasNewIds = (incoming: SelectionDocument, personal: SelectionDocument) =>
    SELECTION_CATEGORIES.some(category => incoming[category].some(id => !personal[category].includes(id)));