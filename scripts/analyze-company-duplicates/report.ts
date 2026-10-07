import {
    appendFileSync,
    writeFileSync,
} from "node:fs";

import type {
    AmbiguousCandidateGroup,
    CompanyDuplicateAnalysisReport,
    CompanyGroup,
    CompanyRecord,
    SimilarityCandidate,
} from "./types";

const OUTPUT_PATH =
    process.env.COMPANY_DUPLICATE_REPORT_PATH ??
    "company-duplicate-analysis.json";

function singleLine(value: string): string {
    return value.replace(/\s+/g, " ");
}

function escapeMarkdownText(value: string): string {
    return singleLine(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/([\\`*_{}[\]()#+.!|~-])/g, "\\$1");
}

function formatInlineCode(value: string): string {
    const name = singleLine(value);
    const longestRun = Math.max(
        0,
        ...[...name.matchAll(/`+/g)].map(match => match[0].length)
    );
    const delimiter = "`".repeat(longestRun + 1);
    const padding = name.startsWith("`") || name.endsWith("`") ? " " : "";

    return `${delimiter}${padding}${name}${padding}${delimiter}`;
}

const percent = (score: number): string => `${(score * 100).toFixed(1)}%`;

function formatCompany(company: CompanyRecord): string {
    const total = company.totalGames;
    const plural = total === 1 ? "" : "s";

    return (
        `ID ${company.id} — ${formatInlineCode(company.name)} — ` +
        `${total} game${plural} — ` +
        `${company.developerGames} developer — ` +
        `${company.publisherGames} publisher`
    );
}

function formatGroup(group: CompanyGroup): string {
    return group.companies.map(company => `- ${formatCompany(company)}`).join("\n");
}

/** A titled section: one block of lines per item, or "None." when empty. */
function section<T>(
    title: string,
    items: readonly T[],
    renderItem: (item: T, position: number) => string[]
): string[] {
    if (items.length === 0) return [title, "", "None.", ""];

    return [title, "", ...items.flatMap((item, index) => renderItem(item, index + 1))];
}

const duplicateItem =
    <T extends { companies: CompanyRecord[] }>(heading: (group: T) => string) =>
    (group: T, position: number): string[] => [
        `### ${position}. ${heading(group)}`,
        "",
        ...group.companies.map(company => `- ${formatCompany(company)}`),
        "",
    ];

const aliasItem = (candidate: SimilarityCandidate, position: number): string[] => [
    `### ${position}. ${percent(candidate.score)}`,
    "",
    "**Left:**",
    formatGroup(candidate.left),
    "",
    "**Right:**",
    formatGroup(candidate.right),
    "",
    `**Signals:** ${candidate.signals.join(", ")}`,
    "",
];

const ambiguousItem = (group: AmbiguousCandidateGroup, position: number): string[] => [
    `### ${position}. Review required`,
    "",
    ...group.companies.flatMap(company => [formatGroup(company), ""]),
    "Similarity links:",
    "",
    ...group.pairs.map(pair =>
        `- ${escapeMarkdownText(pair.left.normalizedName)} ↔ ` +
        `${escapeMarkdownText(pair.right.normalizedName)} — ${percent(pair.score)}`
    ),
    "",
];

export function formatMarkdown(report: CompanyDuplicateAnalysisReport): string {
    const { summary } = report;
    const summaryRows: [string, number][] = [
        ["Exact duplicates", summary.exactDuplicateGroups],
        ["Normalized duplicates", summary.normalizedDuplicateGroups],
        ["Alias / name-variant candidates", summary.aliasCandidates],
        ["Ambiguous candidate groups", summary.ambiguousGroups],
    ];

    const lines = [
        "# Company Duplicate Analysis",
        "",
        `_Generated: ${report.generatedAt}_`,
        "",
        "Read-only analysis. No database changes were made.",
        "",
        "## Summary",
        "",
        "| Category | Count |",
        "|---|---:|",
        ...summaryRows.map(([label, count]) => `| ${label} | ${count} |`),
        "",
        ...section(
            "## Exact duplicates",
            report.exactDuplicates,
            duplicateItem(group => escapeMarkdownText(group.name))
        ),
        ...section(
            "## Normalized duplicates",
            report.normalizedDuplicates,
            duplicateItem(group => formatInlineCode(group.normalizedName))
        ),
        ...section("## Alias / name-variant candidates", report.aliasCandidates, aliasItem),
        ...section("## Ambiguous candidate groups", report.ambiguousCandidates, ambiguousItem),
    ];

    return `${lines.join("\n")}\n`;
}

export function writeReport(report: CompanyDuplicateAnalysisReport): void {
    const markdown = formatMarkdown(report);

    writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    console.log(markdown);

    const summaryPath = process.env.GITHUB_STEP_SUMMARY;

    if (summaryPath) {
        appendFileSync(summaryPath, markdown, "utf8");
    }

    console.log(`JSON report written to ${OUTPUT_PATH}`);
}
