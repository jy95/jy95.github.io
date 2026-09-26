import {
    describe,
    expect,
    it,
} from "vitest";
import Database from "better-sqlite3";

import {
    normalizeCompanyName,
} from "./normalize";

import {
    calculateSimilarity,
    jaroWinkler,
} from "./similarity";

import {
    analyzeCompanies,
} from "./analyze";
import { loadCompanies } from "./database";
import { formatMarkdown } from "./report";
import type { CompanyRecord } from "./types";

function company(
    id: number,
    name: string,
    counts: Partial<Pick<CompanyRecord, "totalGames" | "developerGames" | "publisherGames">> = {}
): CompanyRecord {
    return {
        id,
        name,
        totalGames: 0,
        developerGames: 0,
        publisherGames: 0,
        ...counts,
    };
}

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
            company(1, "Ubisoft Montreal", {
                totalGames: 10,
                developerGames: 10,
            }),
            company(2, "Ubisoft Montréal", {
                totalGames: 2,
                developerGames: 2,
            }),
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

    it("handles empty, identical, unrelated, and transposed Jaro inputs", () => {
        expect(jaroWinkler("", "")).toBe(1);
        expect(jaroWinkler("", "Acme")).toBe(0);
        expect(jaroWinkler("Acme", "")).toBe(0);
        expect(jaroWinkler("abc", "xyz")).toBe(0);
        expect(jaroWinkler("MARTHA", "MARHTA")).toBeGreaterThan(0.9);
    });

    it("reports identity, containment, prefix, and partial overlap signals", () => {
        expect(calculateSimilarity("ACME", "Acme")).toEqual({
            score: 1,
            signals: ["normalized names are identical"],
        });
        expect(calculateSimilarity("", "Acme")).toEqual({ score: 0, signals: [] });
        expect(calculateSimilarity("Acme", "Acme Studio").signals)
            .toContain("all shorter-name tokens are contained");
        expect(calculateSimilarity("Acme Studio", "Acme").signals)
            .toContain("all shorter-name tokens are contained");
        expect(calculateSimilarity("Acme Blue", "Acme Red").signals)
            .toContain("partial token overlap");
        expect(calculateSimilarity("Nintendo", "Ubisoft").signals)
            .not.toContain("strong shared prefix");
    });

    it("applies configurable fuzzy thresholds to short and blank names", () => {
        const records = [company(1, ""), company(2, "A")];
        expect(analyzeCompanies(records).aliasCandidates).toHaveLength(0);
        const report = analyzeCompanies(records, {
            fuzzyScore: 0,
            minFuzzyNameLength: 0,
        });
        expect(report.aliasCandidates).toHaveLength(1);
        expect(report.aliasCandidates[0].left.normalizedName).toBe("");
        expect(report.thresholds).toEqual({ fuzzyScore: 0, minFuzzyNameLength: 0 });
    });

    it("sorts separate alias pairs by score", () => {
        const report = analyzeCompanies([
            company(1, "WayForward"),
            company(2, "WayForward Technologies"),
            company(3, "Acme Studio"),
            company(4, "Acme Studios"),
        ]);
        expect(report.aliasCandidates).toHaveLength(2);
        expect(report.aliasCandidates[0].score)
            .toBeGreaterThanOrEqual(report.aliasCandidates[1].score);
    });

    it("orders ambiguous groups by their highest pair score", () => {
        const report = analyzeCompanies([
            company(1, "Acme Interactive"),
            company(2, "Acme Interactiv"),
            company(3, "Acme Interactive Games"),
            company(4, "Beta Game"),
            company(5, "Beta Game Studio"),
            company(6, "Beta Game Studios"),
        ]);

        expect(report.ambiguousCandidates).toHaveLength(2);
        const [first, second] = report.ambiguousCandidates;
        expect(first.companies[0].normalizedName)
            .toBe("acme interactive");
        expect(first.pairs[0].score)
            .toBeLessThan(second.pairs[0].score);
        expect(Math.max(...first.pairs.map(pair => pair.score)))
            .toBeGreaterThan(Math.max(...second.pairs.map(pair => pair.score)));
    });

    it("counts a game in both roles only once in the total", () => {
        const db = new Database(":memory:");

        try {
            db.exec(`
                CREATE TABLE companies (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
                CREATE TABLE games_companies (game INTEGER, company INTEGER, role TEXT);
                INSERT INTO companies VALUES (1, 'Acme'), (2, 'No games');
                INSERT INTO games_companies VALUES
                    (10, 1, 'developer'),
                    (10, 1, 'publisher'),
                    (11, 1, 'developer');
            `);

            const companies = loadCompanies(db);
            expect(companies).toEqual([
                {
                    id: 1,
                    name: "Acme",
                    totalGames: 2,
                    developerGames: 2,
                    publisherGames: 1,
                },
                {
                    id: 2,
                    name: "No games",
                    totalGames: 0,
                    developerGames: 0,
                    publisherGames: 0,
                },
            ]);

            const report = analyzeCompanies([
                ...companies,
                { ...companies[0], id: 3 },
            ]);
            expect(formatMarkdown(report))
                .toContain("2 games — 2 developer — 1 publisher");
        } finally {
            db.close();
        }
    });

    it("escapes company names in the Markdown summary", () => {
        const name = "Acme `Tools` [link](https://example.com) <img>\n## injected";
        const report = analyzeCompanies([
            company(1, name),
            company(2, name),
        ]);
        const left = {
            normalizedName: "[spoof](https://example.com)",
            companies: [company(3, "[spoof](https://example.com)")],
        };
        const right = {
            normalizedName: "*studio*",
            companies: [company(4, "*studio*")],
        };
        report.ambiguousCandidates = [{
            companies: [left, right],
            pairs: [{ left, right, score: 0.9, signals: [] }],
        }];

        const markdown = formatMarkdown(report);
        expect(markdown).toContain(
            "Acme \\`Tools\\` \\[link\\]\\(https://example\\.com\\) &lt;img&gt; \\#\\# injected"
        );
        expect(markdown).toContain(
            "``Acme `Tools` [link](https://example.com) <img> ## injected``"
        );
        expect(markdown).toContain(
            "- \\[spoof\\]\\(https://example\\.com\\) ↔ \\*studio\\* — 90.0%"
        );
        expect(markdown).not.toContain("\n## injected");
    });
});
