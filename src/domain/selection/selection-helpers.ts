import { SELECTION_CATEGORIES } from './categories';
import type { SelectionDocument, SelectionCategory } from './types';

export const unique = (ids: string[]): string[] => [...new Set(ids)];

export const buildSelection = (
  ids: (category: SelectionCategory) => string[]
): SelectionDocument =>
  Object.fromEntries(
    SELECTION_CATEGORIES.map(category => [category, ids(category)])
  ) as SelectionDocument;