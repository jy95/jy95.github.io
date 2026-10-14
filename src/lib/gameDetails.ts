import { extractGameCardProps } from "@/domain/games";
import type { GameDetailsResponse } from "@/domain/games/details";
import {
    loadPublishedGames, loadDlcGroups, loadPlanningGames, loadBacklogGames,
    toPublishedGame, toPlanningEntry, toBacklogEntry,
} from "@/lib/gamesData";

export async function resolveGameDetails(id: string): Promise<GameDetailsResponse | undefined> {
    const published = (await loadPublishedGames()).find((game) => extractGameCardProps(game).id === id);
    if (published) return { source: "published", game: toPublishedGame(published) };

    const dlc = (await loadDlcGroups()).flatMap((group) => group.dlcs)
        .find((game) => extractGameCardProps(game).id === id);
    if (dlc) return { source: "published", category: "dlcs", game: toPublishedGame(dlc) };

    const planning = (await loadPlanningGames()).find((game) => extractGameCardProps(game).id === id);
    if (planning) return { source: "planning", game: toPlanningEntry(planning) };

    const backlog = (await loadBacklogGames()).find((game) => game.id.toString() === id);
    if (backlog) return { source: "backlog", game: toBacklogEntry(backlog) };

    return undefined;
}

/** Enumerate the same sources and identities used by the runtime resolver. */
export async function gameDetailStaticParams(): Promise<{ id: string }[]> {
    const [published, groups, planning, backlog] = await Promise.all([
        loadPublishedGames(), loadDlcGroups(), loadPlanningGames(), loadBacklogGames(),
    ]);
    const ids = [
        ...[...published, ...groups.flatMap(group => group.dlcs), ...planning]
            .map(game => extractGameCardProps(game).id),
        ...backlog.map(game => String(game.id)),
    ];
    return ids.map(id => ({ id }));
}
