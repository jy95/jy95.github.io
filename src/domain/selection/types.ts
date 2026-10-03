import { SELECTION_CATEGORIES } from './categories';
import type { GameDetailsResponse } from '@/domain/games/details';

export type SelectionCategory = typeof SELECTION_CATEGORIES[number];
export type SelectionDocument = Record<SelectionCategory, string[]>;
export type SelectionKind = 'all' | SelectionCategory;
export type SelectionIdentifier = { category: SelectionCategory; selectionId: string };
export type SelectionEntry = GameDetailsResponse & SelectionIdentifier;