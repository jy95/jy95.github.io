import { loadBacklogGames, loadDlcGroups, loadPlanningGames, loadPublishedGames, toBacklogEntry, toPlanningEntry, toPublishedGame } from '@/lib/gamesData';
import type { GameDetailsResponse } from '@/domain/games/details';

export type SelectionEntry = GameDetailsResponse & { selectionId: string };

export async function loadSelectionCatalogue(): Promise<SelectionEntry[]> {
    const [published, dlcs, planning, backlog] = await Promise.all([
        loadPublishedGames(), loadDlcGroups(), loadPlanningGames(), loadBacklogGames(),
    ]);
    const entries: SelectionEntry[] = [
        ...published.map(toPublishedGame).map(game => ({ source: 'published' as const, game, selectionId: game.id })),
        ...dlcs.flatMap(group => group.dlcs).map(toPublishedGame).map(game => ({ source: 'published' as const, game, selectionId: game.id })),
        ...planning.map(toPlanningEntry).map(game => ({ source: 'planning' as const, game, selectionId: game.id })),
        ...backlog.map(toBacklogEntry).map(game => ({ source: 'backlog' as const, game, selectionId: `backlog:${game.id}` })),
    ];
    // Published records take precedence when a game also appears in planning/DLCs.
    return [...new Map(entries.reverse().map(entry => [entry.selectionId, entry])).values()].reverse();
}
