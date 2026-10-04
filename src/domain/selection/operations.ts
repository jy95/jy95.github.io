import { SELECTION_CATEGORIES } from './categories';
import type { SelectionDocument, SelectionCategory } from './types';

const unique = (ids: string[]) => [...new Set(ids)];

const build = (ids: (category: SelectionCategory) => string[]) =>
    Object.fromEntries(SELECTION_CATEGORIES.map(category => [category, ids(category)])) as SelectionDocument;

export const emptySelection = (): SelectionDocument => build(() => []);

export const isEmpty = (document: SelectionDocument) =>
    SELECTION_CATEGORIES.every(category => document[category].length === 0);

export function toSelectionDocument(value: unknown): SelectionDocument {
    if (typeof value !== 'object' || value === null) return emptySelection();

    const source = value as Record<string, unknown>;
    return build(category => {
        const ids = source[category];
        return Array.isArray(ids) ? unique(ids.filter((id): id is string => typeof id === 'string')) : [];
    });
}

export const mergeSelections = (a: SelectionDocument, b: SelectionDocument) =>
    build(category => unique([...a[category], ...b[category]]));

export function toggleId(document: SelectionDocument, category: SelectionCategory, id: string) {
    const ids = document[category];
    return {
        ...document,
        [category]: ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id],
    };
}

export function removeId(document: SelectionDocument, category: SelectionCategory, id: string) {
    return {
        ...document,
        [category]: document[category].filter(value => value !== id),
    };
}

export const hasNewIds = (incoming: SelectionDocument, personal: SelectionDocument) =>
    SELECTION_CATEGORIES.some(category =>
        incoming[category].some(id => !personal[category].includes(id))
    );
