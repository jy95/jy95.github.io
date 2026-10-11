import { COVER_PATHS } from "@/domain/games/coverPaths";
import { loadDlcGroups, toPublishedGame } from "@/lib/gamesData";
import type { StoredDlcGroup } from "@/lib/gamesData";
import type { DlcSummary, DlcDetail } from "@/domain/dlcs/types";

export { loadDlcGroups };

export function toDlcSummary(group: StoredDlcGroup): DlcSummary {
    return { id: group.id, name: group.game_title, imagePath: `${COVER_PATHS.games}/${group.id}/cover.webp`, dlcsCount: group.dlcs.length };
}

export function toDlcDetail(group: StoredDlcGroup): DlcDetail {
    return { ...toDlcSummary(group), items: group.dlcs.map(toPublishedGame) };
}
