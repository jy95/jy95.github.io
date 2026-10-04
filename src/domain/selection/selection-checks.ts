import { SELECTION_CATEGORIES } from './categories';
import type { SelectionDocument } from './types';

export const isEmpty = (document: SelectionDocument): boolean =>
  SELECTION_CATEGORIES.every(category => document[category].length === 0);

export const hasNewIds = (incoming: SelectionDocument, personal: SelectionDocument): boolean =>
  SELECTION_CATEGORIES.some(category =>
    incoming[category].some(id => !personal[category].includes(id))
  );