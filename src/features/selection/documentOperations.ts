import type { SelectionCategory, SelectionDocument } from './documentTypes';

export function toggleSelectionIdentifier(
    document: SelectionDocument,
    id: string,
    category: SelectionCategory,
): SelectionDocument {
    const values = document[category];
    return {
        ...document,
        [category]: values.includes(id) ? values.filter(value => value !== id) : [...values, id],
    };
}
