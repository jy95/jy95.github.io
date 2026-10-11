import { describe, it, expect } from "vitest";
import { compareDlcs } from "./sorting";
import type { DlcSummary } from "./types";
const entries: DlcSummary[] = [
    { id: "2", name: "Same", dlcsCount: 2, imagePath: "" },
    { id: "10", name: "Same", dlcsCount: 2, imagePath: "" },
    { id: "3", name: "Alpha", dlcsCount: 1, imagePath: "" },
];
describe("compareDlcs", () => {
    it.each(["countAsc", "countDesc"] as const)("uses ascending names and IDs for equal counts in %s", sort => {
        const equalCounts = entries.map(entry => ({ ...entry, dlcsCount: 2 }));
        expect([...equalCounts].sort((a, b) => compareDlcs(a, b, sort)).map(entry => entry.id)).toEqual(["3", "10", "2"]);
    });
    it.each(["nameAsc", "countAsc"] as const)("sorts %s with string identifier ties", sort => {
        expect([...entries].sort((a, b) => compareDlcs(a, b, sort)).map(entry => entry.id)).toEqual(["3", "10", "2"]);
    });
    it.each(["nameDesc", "countDesc"] as const)("sorts %s with ascending ties", sort => {
        expect([...entries].sort((a, b) => compareDlcs(a, b, sort)).map(entry => entry.id)).toEqual(["10", "2", "3"]);
    });
});
