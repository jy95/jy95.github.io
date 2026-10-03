export const SELECTION_CATEGORIES = ['games', 'backlog', 'dlcs', 'planning'] as const;
export type SelectionCategory = typeof SELECTION_CATEGORIES[number];
export type SelectionDocument = Record<SelectionCategory, string[]>;

/** Page-level content filter: one category, or everything. */
export type SelectionKind = 'all' | SelectionCategory;

export const isSelectionKind = (value: string): value is SelectionKind =>
    value === 'all' || (SELECTION_CATEGORIES as readonly string[]).includes(value);

export const emptySelection = (): SelectionDocument => ({ games: [], backlog: [], dlcs: [], planning: [] });