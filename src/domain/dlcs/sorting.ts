import type { DlcSort, DlcSummary } from "./types";

export const DLC_SORT_OPTIONS = ["nameAsc", "nameDesc", "countDesc", "countAsc"] as const satisfies readonly DlcSort[];

export function compareDlcs(first: DlcSummary, second: DlcSummary, sort: DlcSort): number {
    const idOrder = first.id.localeCompare(second.id);
    const nameOrder = first.name.localeCompare(second.name) || idOrder;
    if (sort === "nameDesc") return second.name.localeCompare(first.name) || idOrder;
    if (sort === "countAsc") return first.dlcsCount - second.dlcsCount || nameOrder;
    if (sort === "countDesc") return second.dlcsCount - first.dlcsCount || nameOrder;
    return nameOrder;
}
