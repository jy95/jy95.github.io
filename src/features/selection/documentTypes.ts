export const SELECTION_CATEGORIES = ['games', 'backlog', 'dlcs', 'planning'] as const;
export type SelectionCategory = typeof SELECTION_CATEGORIES[number];
export type SelectionCategories = Record<string, SelectionCategory>;
export type SelectionDocument = { version: 2 } & Record<SelectionCategory, string[]> & { legacyIds?: string[] };

export const emptySelection = (): SelectionDocument => ({ version: 2, games: [], backlog: [], dlcs: [], planning: [] });
