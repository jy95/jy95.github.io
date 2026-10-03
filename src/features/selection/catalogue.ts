import { loadBacklogGames, loadDlcGroups, loadPlanningGames, loadPublishedGames, toBacklogEntry, toPlanningEntry, toPublishedGame } from '@/lib/gamesData';
import type { RawGame } from '@/domain/games';
import type { GameDetailsResponse } from '@/domain/games/details';

import type { SelectionCategory } from './selectionDocument';

export type SelectionEntry = GameDetailsResponse & { selectionId: string; category: SelectionCategory };

const publishedEntry = (category: 'games' | 'dlcs') => (raw: RawGame): SelectionEntry => {
    const game = toPublishedGame(raw);
    return { source: 'published', category, game, selectionId: game.id };
};

export async function loadSelectionCatalogue(): Promise<SelectionEntry[]> {
    const [published, dlcs, planning, backlog] = await Promise.all([
        loadPublishedGames(), loadDlcGroups(), loadPlanningGames(), loadBacklogGames(),
    ]);

    // Listed by classification precedence: published games, DLCs, planning, then backlog.
    const entries: SelectionEntry[] = [
        ...published.map(publishedEntry('games')),
        ...dlcs.flatMap(group => group.dlcs).map(publishedEntry('dlcs')),
        ...planning.map((raw): SelectionEntry => {
            const game = toPlanningEntry(raw);
            return { source: 'planning', category: 'planning', game, selectionId: game.id };
        }),
        ...backlog.map((raw): SelectionEntry => {
            const game = toBacklogEntry(raw);
            return { source: 'backlog', category: 'backlog', game, selectionId: game.id };
        }),
    ];

    // The first (highest-precedence) occurrence of an identifier wins. The `source`
    // discriminant stays independent of the selection category.
    const unique = new Map<string, SelectionEntry>();
    for (const entry of entries) {
        if (!unique.has(entry.selectionId)) unique.set(entry.selectionId, entry);
    }
    return [...unique.values()];
}