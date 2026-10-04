import type { BacklogEntry, PlanningEntry } from '@/domain/games/details';
import type { CardGame } from '@/domain/games/types';
import type { SelectionCategory } from './types';

/** Explicit catalogue categories take precedence over this raw-game fallback. */
export function selectionCategoryForGame(game: BacklogEntry | CardGame | PlanningEntry): SelectionCategory {
    if (!('url_type' in game)) return 'backlog';
    return 'status' in game ? 'planning' : 'games';
}
