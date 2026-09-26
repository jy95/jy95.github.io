import {
    appendFileSync,
    writeFileSync,
} from "node:fs";

import type {
    CompanyDuplicateAnalysisReport,
    CompanyRecord,
    CompanyGroup,
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
        .replace(/([\\`*_{}\[\]()#+.!|~\-])/g, "\\$1");
}

function formatInlineCode(value: string): string {
    const name = singleLine(value);
    const longestRun = Math.max(
        0,
        ...[...name.matchAll(/`+/g)].map(
            match => match[0].length
        )
    );
    const delimiter = "`".repeat(longestRun + 1);
    const padding = name.startsWith("`") || name.endsWith("`")
        ? " "
        : "";

    return `${delimiter}${padding}${name}${padding}${delimiter}`;
}

function formatCompany(
    company: CompanyRecord
): string {
    const total = company.totalGames;

    return (
        `ID ${company.id} — ${formatInlineCode(company.name)} — ` +
        `${total} game${total === 1 ? "" : "s"} — ` +
        `${company.developerGames} developer — ` +
        `${company.publisherGames} publisher`
    );
}

function formatGroup(
    group: CompanyGroup
): string {
    return group.companies
        .map(company => `- ${formatCompany(company)}`)
        .join("\n");
}

export function formatMarkdown(
    report: CompanyDuplicateAnalysisReport
): string {
    const lines: string[] = [];

    lines.push("# Company Duplicate Analysis");
    lines.push("");
    lines.push(
        `_Generated: ${report.generatedAt}_`
    );
    lines.push("");
    lines.push(
        "Read-only analysis. No database changes were made."
    );
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push("| Category | Count |");
    lines.push("|---|---:|");
    lines.push(
        `| Exact duplicates | ${report.summary.exactDuplicateGroups} |`
    );
    lines.push(
        `| Normalized duplicates | ${report.summary.normalizedDuplicateGroups} |`
    );
    lines.push(
        `| Alias / name-variant candidates | ${report.summary.aliasCandidates} |`
    );
    lines.push(
        `| Ambiguous candidate groups | ${report.summary.ambiguousGroups} |`
    );
    lines.push("");

    lines.push("## Exact duplicates");
    lines.push("");

    if (!report.exactDuplicates.length) {
        lines.push("None.");
        lines.push("");
    } else {
        report.exactDuplicates.forEach(
            (group, index) => {
                lines.push(
                    `### ${index + 1}. ${escapeMarkdownText(group.name)}`
                );
                lines.push("");

                for (const company of group.companies) {
                    lines.push(
                        `- ${formatCompany(company)}`
                    );
                }

                lines.push("");
            }
        );
    }

    lines.push("## Normalized duplicates");
    lines.push("");

    if (!report.normalizedDuplicates.length) {
        lines.push("None.");
        lines.push("");
    } else {
        report.normalizedDuplicates.forEach(
            (group, index) => {
                lines.push(
                    `### ${index + 1}. ${formatInlineCode(group.normalizedName)}`
                );
                lines.push("");

                for (const company of group.companies) {
                    lines.push(
                        `- ${formatCompany(company)}`
                    );
                }

                lines.push("");
            }
        );
    }

    lines.push(
        "## Alias / name-variant candidates"
    );
    lines.push("");

    if (!report.aliasCandidates.length) {
        lines.push("None.");
        lines.push("");
    } else {
        report.aliasCandidates.forEach(
            (candidate, index) => {
                lines.push(
                    `### ${index + 1}. ` +
                    `${(candidate.score * 100).toFixed(1)}%`
                );
                lines.push("");

                lines.push("**Left:**");
                lines.push(
                    formatGroup(candidate.left)
                );
                lines.push("");

                lines.push("**Right:**");
                lines.push(
                    formatGroup(candidate.right)
                );
                lines.push("");

                lines.push(
                    `**Signals:** ${candidate.signals.join(", ")}`
                );
                lines.push("");
            }
        );
    }

    lines.push(
        "## Ambiguous candidate groups"
    );
    lines.push("");

    if (!report.ambiguousCandidates.length) {
        lines.push("None.");
        lines.push("");
    } else {
        report.ambiguousCandidates.forEach(
            (group, index) => {
                lines.push(
                    `### ${index + 1}. Review required`
                );
                lines.push("");

                for (const company of group.companies) {
                    lines.push(
                        formatGroup(company)
                    );
                    lines.push("");
                }

                lines.push("Similarity links:");
                lines.push("");

                for (const pair of group.pairs) {
                    lines.push(
                        `- ${escapeMarkdownText(pair.left.normalizedName)} ↔ ` +
                        `${escapeMarkdownText(pair.right.normalizedName)} — ` +
                        `${(pair.score * 100).toFixed(1)}%`
                    );
                }

                lines.push("");
            }
        );
    }

    return `${lines.join("\n")}\n`;
}

export function writeReport(
    report: CompanyDuplicateAnalysisReport
): void {
    const markdown =
        formatMarkdown(report);

    writeFileSync(
        OUTPUT_PATH,
        `${JSON.stringify(report, null, 2)}\n`,
        "utf8"
    );

    console.log(markdown);

    const summaryPath =
        process.env.GITHUB_STEP_SUMMARY;

    if (summaryPath) {
        appendFileSync(
            summaryPath,
            markdown,
            "utf8"
        );
    }

    console.log(
        `JSON report written to ${OUTPUT_PATH}`
    );
}
