export const SELECTION_CATEGORIES = ['games', 'backlog', 'dlcs', 'planning'] as const;
import type { SelectionCategory, SelectionKind } from './types';

export function isSelectionCategory(value: unknown): value is SelectionCategory {
  return typeof value === 'string' && SELECTION_CATEGORIES.includes(value as SelectionCategory);
}

export function isSelectionKind(value: unknown): value is SelectionKind {
  return value === 'all' || isSelectionCategory(value);
}