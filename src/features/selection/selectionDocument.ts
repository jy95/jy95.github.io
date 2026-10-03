import type { SelectionEntry } from './catalogue';

/** Single place to add a category. Everything else derives from this array. */
export const SELECTION_CATEGORIES = ['games', 'backlog', 'dlcs', 'planning'] as const;
export type SelectionCategory = typeof SELECTION_CATEGORIES[number];
export type SelectionDocument = Record<SelectionCategory, string[]>;
export type SelectionKind = 'all' | SelectionCategory;

const unique = (ids: string[]) => [...new Set(ids)];
const isString = (value: unknown): value is string => typeof value === 'string';
const build = (ids: (category: SelectionCategory) => string[]) =>
    Object.fromEntries(SELECTION_CATEGORIES.map(category => [category, ids(category)])) as SelectionDocument;

export const emptySelection = (): SelectionDocument => build(() => []);

export const isSelectionKind = (value: string): value is SelectionKind =>
    value === 'all' || SELECTION_CATEGORIES.some(category => category === value);

export const isEmpty = (document: SelectionDocument) =>
    SELECTION_CATEGORIES.every(category => document[category].length === 0);

/** Untrusted input (storage, URL) → clean document. Unknown fields are dropped. */
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

/** True when importing `incoming` would change `personal`. */
export const hasNewIds = (incoming: SelectionDocument, personal: SelectionDocument) =>
    SELECTION_CATEGORIES.some(category => incoming[category].some(id => !personal[category].includes(id)));

/** Identifiers → catalogue entries. Ids are matched per category; missing ones are only counted. */
export function resolveSelection(catalogue: readonly SelectionEntry[], document: SelectionDocument | null) {
    const entries: SelectionEntry[] = [];
    if (!document) return { entries, missing: 0 };
    const byKey = new Map(catalogue.map(entry => [`${entry.category}:${entry.selectionId}`, entry]));
    for (const category of SELECTION_CATEGORIES) {
        for (const id of document[category]) {
            const entry = byKey.get(`${category}:${id}`);
            if (entry) entries.push(entry);
        }
    }
    const requested = SELECTION_CATEGORIES.reduce((sum, category) => sum + document[category].length, 0);
    return { entries, missing: requested - entries.length };
}

/** Inverse of resolution: a document containing exactly these entries. */
export function documentOf(entries: readonly SelectionEntry[]): SelectionDocument {
    const document = emptySelection();
    for (const entry of entries) document[entry.category].push(entry.selectionId);
    return document;
}