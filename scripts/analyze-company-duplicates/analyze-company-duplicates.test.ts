import {
    describe,
    expect,
    it,
} from "vitest";

import {
    normalizeCompanyName,
} from "./normalize";

import {
    calculateSimilarity,
} from "./similarity";

import {
    analyzeCompanies,
} from "./analyze";

describe("company duplicate analysis", () => {
    it("normalizes accents and case", () => {
        expect(
            normalizeCompanyName(
                "Ubisoft Montréal"
            )
        ).toBe("ubisoft montreal");
    });

    it("detects normalized duplicates", () => {
        const report = analyzeCompanies([
            {
                id: 1,
                name: "Ubisoft Montreal",
                developerGames: 10,
                publisherGames: 0,
            },
            {
                id: 2,
                name: "Ubisoft Montréal",
                developerGames: 2,
                publisherGames: 0,
            },
        ]);

        expect(
            report.normalizedDuplicates
        ).toHaveLength(1);
    });

    it("detects a likely name variant", () => {
        const result =
            calculateSimilarity(
                "WayForward",
                "WayForward Technologies"
            );

        expect(result.score)
            .toBeGreaterThanOrEqual(0.85);
    });

    it("does not match unrelated companies", () => {
        const result =
            calculateSimilarity(
                "Nintendo",
                "Ubisoft"
            );

        expect(result.score)
            .toBeLessThan(0.85);
    });
});