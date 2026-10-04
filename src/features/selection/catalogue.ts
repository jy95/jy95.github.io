import { loadBacklogGames, loadDlcGroups, loadPlanningGames, loadPublishedGames, toBacklogEntry, toPlanningEntry, toPublishedGame } from '@/lib/gamesData';
import type { RawGame } from '@/domain/games';
import type { SelectionEntry } from '@/domain/selection/types';

const publishedEntry = (category: 'games' | 'dlcs') => (raw: RawGame): SelectionEntry => {
    const game = toPublishedGame(raw);
    return { source: 'published', category, game, selectionId: game.id };
};

export async function loadSelectionCatalogue(): Promise<SelectionEntry[]> {
    const [published, dlcs, planning, backlog] = await Promise.all([
        loadPublishedGames(), loadDlcGroups(), loadPlanningGames(), loadBacklogGames(),
    ]);

    // Preserve source order within each category.
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

    // Keep the first occurrence within each category.
    const unique = new Map<string, SelectionEntry>();
    for (const entry of entries) {
        const key = `${entry.category}:${entry.selectionId}`;
        if (!unique.has(key)) unique.set(key, entry);
    }
    return [...unique.values()];
}