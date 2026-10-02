export const SELECTION_CATEGORIES = ['games', 'backlog', 'dlcs', 'planning'] as const;
export type SelectionCategory = typeof SELECTION_CATEGORIES[number];
export type SelectionDocument = Record<SelectionCategory, string[]>;

export const emptySelection = (): SelectionDocument => ({ games: [], backlog: [], dlcs: [], planning: [] });
