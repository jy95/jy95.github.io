import type { SelectionDocument, SelectionCategory } from './types';
import { unique, buildSelection } from './selection-helpers';

export const emptySelection = (): SelectionDocument => buildSelection(() => []);

export const mergeSelections = (a: SelectionDocument, b: SelectionDocument): SelectionDocument =>
  buildSelection(category => unique([...a[category], ...b[category]]));

export function toggleId(
  document: SelectionDocument,
  category: SelectionCategory,
  id: string
): SelectionDocument {
  const ids = document[category];
  return {
    ...document,
    [category]: ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id],
  };
}

export function removeId(
  document: SelectionDocument,
  category: SelectionCategory,
  id: string
): SelectionDocument {
  return {
    ...document,
    [category]: document[category].filter(value => value !== id),
  };
}