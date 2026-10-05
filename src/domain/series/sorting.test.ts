import { describe, it, expect } from "vitest";
import { compareSeries } from "./sorting";
import type { SeriesSummary } from "./types";
const entries: SeriesSummary[] = [
    { id: 2, name: "Same", gamesCount: 2, imagePath: "" },
    { id: 10, name: "Same", gamesCount: 2, imagePath: "" },
    { id: 3, name: "Alpha", gamesCount: 1, imagePath: "" },
];
describe("compareSeries", () => {
    it.each(["nameAsc", "countAsc"] as const)("sorts %s with string identifier ties", sort => {
        expect([...entries].sort((a, b) => compareSeries(a, b, sort)).map(entry => entry.id)).toEqual([3, 10, 2]);
    });
    it.each(["nameDesc", "countDesc"] as const)("sorts %s with ascending ties", sort => {
        expect([...entries].sort((a, b) => compareSeries(a, b, sort)).map(entry => entry.id)).toEqual([10, 2, 3]);
    });
});
