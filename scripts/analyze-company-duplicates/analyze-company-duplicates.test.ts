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
} from "./similarity";

import {
    analyzeCompanies,
} from "./analyze";
import { loadCompanies } from "./database";
import { formatMarkdown } from "./report";

function company(id: number, name: string) {
    return {
        id,
        name,
        totalGames: 0,
        developerGames: 0,
        publisherGames: 0,
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
            {
                id: 1,
                name: "Ubisoft Montreal",
                totalGames: 10,
                developerGames: 10,
                publisherGames: 0,
            },
            {
                id: 2,
                name: "Ubisoft Montréal",
                totalGames: 2,
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
