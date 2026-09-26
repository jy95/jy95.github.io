import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { analyzeCompanies } from "./analyze";
import { formatMarkdown } from "./report";
import type { CompanyRecord } from "./types";

const company = (id: number, name: string, totalGames = 0): CompanyRecord => ({
    id,
    name,
    totalGames,
    developerGames: totalGames,
    publisherGames: 0,
});

const tempDirs: string[] = [];

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    for (const dir of tempDirs.splice(0)) {
        rmSync(dir, { recursive: true, force: true });
    }
});

describe("company duplicate report", () => {
    it("formats empty sections and all populated sections", () => {
        const empty = formatMarkdown(analyzeCompanies([]));
        expect(empty.match(/None\./g)).toHaveLength(4);

        const report = analyzeCompanies([
            company(1, "Acme", 1),
            company(2, "Acme"),
            company(3, "ACME"),
            company(4, "WayForward"),
            company(5, "WayForward Technologies"),
        ]);
        const markdown = formatMarkdown(report);
        expect(markdown).toContain("## Exact duplicates\n\n### 1. Acme");
        expect(markdown).toContain("## Normalized duplicates\n\n### 1. `acme`");
        expect(markdown).toContain("## Alias / name-variant candidates\n\n### 1.");
        expect(markdown).toContain("**Signals:**");
        expect(markdown).toContain("1 game — 1 developer — 0 publisher");
        expect(markdown).toContain("0 games — 0 developer — 0 publisher");
    });

    it("escapes Markdown punctuation and embedded code delimiters", () => {
        const name = "`A` & <B> [x](y) *_{}#+.!|~-\\\n## heading";
        const report = analyzeCompanies([company(1, name), company(2, name)]);
        const markdown = formatMarkdown(report);
        expect(markdown).toContain("&amp; &lt;B&gt;");
        expect(markdown).toContain("\\[x\\]\\(y\\)");
        expect(markdown).toContain("\\*\\_\\{\\}\\#\\+\\.\\!\\|\\~\\-\\\\");
        expect(markdown).toContain("`` `A` & <B> [x](y)");
        expect(markdown).not.toContain("\n## heading");

        const boundary = analyzeCompanies([company(3, "`name`"), company(4, "`name`")]);
        expect(formatMarkdown(boundary)).toContain("`` `name` ``");
    });

    it("writes JSON to the configured path and appends the workflow summary", async () => {
        const dir = mkdtempSync(join(tmpdir(), "company-report-"));
        tempDirs.push(dir);
        const outputPath = join(dir, "report.json");
        const summaryPath = join(dir, "summary.md");
        vi.stubEnv("COMPANY_DUPLICATE_REPORT_PATH", outputPath);
        vi.stubEnv("GITHUB_STEP_SUMMARY", summaryPath);
        const { writeReport } = await import("./report");
        const report = analyzeCompanies([company(1, "Acme")]);
        const log = vi.spyOn(console, "log").mockImplementation(() => {});

        writeReport(report);

        expect(JSON.parse(readFileSync(outputPath, "utf8"))).toEqual(report);
        expect(readFileSync(summaryPath, "utf8")).toBe(formatMarkdown(report));
        expect(log).toHaveBeenCalledWith(formatMarkdown(report));
        expect(log).toHaveBeenCalledWith(`JSON report written to ${outputPath}`);
    });

    it("uses the default path and skips the summary when unset", async () => {
        const dir = mkdtempSync(join(tmpdir(), "company-report-default-"));
        tempDirs.push(dir);
        const previousCwd = process.cwd();
        vi.stubEnv("COMPANY_DUPLICATE_REPORT_PATH", undefined);
        vi.stubEnv("GITHUB_STEP_SUMMARY", undefined);
        vi.resetModules();
        try {
            process.chdir(dir);
            const { writeReport } = await import("./report");
            vi.spyOn(console, "log").mockImplementation(() => {});
            writeReport(analyzeCompanies([]));
            expect(readFileSync(join(dir, "company-duplicate-analysis.json"), "utf8"))
                .toContain('"companiesScanned": 0');
        } finally {
            process.chdir(previousCwd);
        }
    });
});
