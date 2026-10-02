import { loadBacklogGames, loadDlcGroups, loadPlanningGames, loadPublishedGames, toBacklogEntry, toPlanningEntry, toPublishedGame } from '@/lib/gamesData';
import type { GameDetailsResponse } from '@/domain/games/details';

import type { SelectionCategory } from './schema';

export type SelectionEntry = GameDetailsResponse & { selectionId: string; category: SelectionCategory };

export async function loadSelectionCatalogue(): Promise<SelectionEntry[]> {
    const [published, dlcs, planning, backlog] = await Promise.all([
        loadPublishedGames(), loadDlcGroups(), loadPlanningGames(), loadBacklogGames(),
    ]);
    const entries: SelectionEntry[] = [
        ...published.map(toPublishedGame).map(game => ({ source: 'published' as const, category: 'games' as const, game, selectionId: game.id })),
        ...dlcs.flatMap(group => group.dlcs).map(toPublishedGame).map(game => ({ source: 'published' as const, category: 'dlcs' as const, game, selectionId: game.id })),
        ...planning.map(toPlanningEntry).map(game => ({ source: 'planning' as const, category: 'planning' as const, game, selectionId: game.id })),
        ...backlog.map(toBacklogEntry).map(game => ({ source: 'backlog' as const, category: 'backlog' as const, game, selectionId: `backlog:${game.id}` })),
    ];
    // Classification precedence: published games, DLCs, planning, then backlog.
    // Keep the source discriminant for rendering independent of selection category.
    return [...new Map(entries.reverse().map(entry => [entry.selectionId, entry])).values()].reverse();
}
