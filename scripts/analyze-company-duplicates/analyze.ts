import {
    normalizeCompanyName,
} from "./normalize";

import {
    calculateSimilarity,
} from "./similarity";

import type {
    AmbiguousCandidateGroup,
    CompanyDuplicateAnalysisReport,
    CompanyGroup,
    CompanyRecord,
    ExactDuplicateGroup,
    NormalizedDuplicateGroup,
    SimilarityCandidate,
} from "./types";

const DEFAULT_FUZZY_SCORE = 0.85;
const DEFAULT_MIN_FUZZY_NAME_LENGTH = 5;

function groupBy<T>(
    values: T[],
    keySelector: (value: T) => string
): Map<string, T[]> {
    const result = new Map<string, T[]>();

    for (const value of values) {
        const key = keySelector(value);
        const existing = result.get(key);

        if (existing) {
            existing.push(value);
        } else {
            result.set(key, [value]);
        }
    }

    return result;
}

function createCompanyGroups(
    companies: CompanyRecord[]
): CompanyGroup[] {
    return [...groupBy(
        companies,
        company => normalizeCompanyName(company.name)
    )].map(([normalizedName, grouped]) => ({
        normalizedName,
        companies: grouped,
    }));
}

function findExactDuplicates(
    companies: CompanyRecord[]
): ExactDuplicateGroup[] {
    return [...groupBy(
        companies,
        company => company.name
    )]
        .filter(([, grouped]) => grouped.length > 1)
        .map(([name, grouped]) => ({
            name,
            companies: grouped,
        }));
}

function findNormalizedDuplicates(
    companies: CompanyRecord[]
): NormalizedDuplicateGroup[] {
    return [...groupBy(
        companies,
        company => normalizeCompanyName(company.name)
    )]
        .filter(([, grouped]) => {
            const names = new Set(
                grouped.map(company => company.name)
            );

            return grouped.length > 1 &&
                names.size > 1;
        })
        .map(([normalizedName, grouped]) => ({
            normalizedName,
            companies: grouped,
        }));
}

function addEdge(
    graph: Map<string, Set<string>>,
    left: string,
    right: string
): void {
    if (!graph.has(left)) {
        graph.set(left, new Set());
    }

    if (!graph.has(right)) {
        graph.set(right, new Set());
    }

    graph.get(left)?.add(right);
    graph.get(right)?.add(left);
}

function findComponents(
    graph: Map<string, Set<string>>
): string[][] {
    const visited = new Set<string>();
    const result: string[][] = [];

    for (const start of graph.keys()) {
        if (visited.has(start)) {
            continue;
        }

        const component: string[] = [];
        const queue = [start];

        visited.add(start);

        for (let index = 0; index < queue.length; index += 1) {
            const current = queue[index];
            component.push(current);

            const neighbors = graph.get(current);

            if (!neighbors) {
                throw new Error(`Missing graph entry for company name: ${current}`);
            }

            for (const next of neighbors) {
                if (!visited.has(next)) {
                    visited.add(next);
                    queue.push(next);
                }
            }
        }

        result.push(component);
    }

    return result;
}

function maxPairScore(
    group: AmbiguousCandidateGroup
): number {
    return group.pairs.reduce(
        (max, pair) => Math.max(max, pair.score),
        0
    );
}

export function analyzeCompanies(
    companies: CompanyRecord[],
    options: {
        fuzzyScore?: number;
        minFuzzyNameLength?: number;
    } = {}
): CompanyDuplicateAnalysisReport {
    const fuzzyScore =
        options.fuzzyScore ?? DEFAULT_FUZZY_SCORE;

    const minFuzzyNameLength =
        options.minFuzzyNameLength ??
        DEFAULT_MIN_FUZZY_NAME_LENGTH;

    const exactDuplicates =
        findExactDuplicates(companies);

    const normalizedDuplicates =
        findNormalizedDuplicates(companies);

    const groups =
        createCompanyGroups(companies);

    const groupsByName =
        new Map(
            groups.map(group => [
                group.normalizedName,
                group,
            ])
        );

    const candidates: SimilarityCandidate[] = [];
    const graph = new Map<string, Set<string>>();

    for (let i = 0; i < groups.length; i += 1) {
        for (let j = i + 1; j < groups.length; j += 1) {
            const left = groups[i];
            const right = groups[j];

            const shorterLength = Math.min(
                left.normalizedName.length,
                right.normalizedName.length
            );

            if (
                shorterLength <
                minFuzzyNameLength
            ) {
                continue;
            }

            const leftName =
                left.companies[0].name;

            const rightName =
                right.companies[0].name;

            const similarity =
                calculateSimilarity(
                    leftName,
                    rightName
                );

            if (similarity.score < fuzzyScore) {
                continue;
            }

            candidates.push({
                left,
                right,
                score: similarity.score,
                signals: similarity.signals,
            });

            addEdge(
                graph,
                left.normalizedName,
                right.normalizedName
            );
        }
    }

    const components =
        findComponents(graph);

    const aliases: SimilarityCandidate[] = [];
    const ambiguous: AmbiguousCandidateGroup[] = [];

    for (const component of components) {
        const pairs = candidates.filter(
            candidate =>
                component.includes(
                    candidate.left.normalizedName
                ) &&
                component.includes(
                    candidate.right.normalizedName
                )
        );

        const componentGroups = component.map(name => {
            const group = groupsByName.get(name);

            if (!group) {
                throw new Error(`Missing company group for normalized name: ${name}`);
            }

            return group;
        });

        if (component.length === 2) {
            aliases.push(...pairs);
        } else {
            ambiguous.push({
                companies: componentGroups,
                pairs,
            });
        }
    }

    aliases.sort(
        (a, b) => b.score - a.score
    );

    ambiguous.sort(
        (a, b) => maxPairScore(b) - maxPairScore(a)
    );

    return {
        version: 1,
        generatedAt: new Date().toISOString(),

        thresholds: {
            fuzzyScore,
            minFuzzyNameLength,
        },

        companiesScanned: companies.length,

        summary: {
            exactDuplicateGroups:
                exactDuplicates.length,
            normalizedDuplicateGroups:
                normalizedDuplicates.length,
            aliasCandidates:
                aliases.length,
            ambiguousGroups:
                ambiguous.length,
        },

        exactDuplicates,
        normalizedDuplicates,
        aliasCandidates: aliases,
        ambiguousCandidates: ambiguous,
    };
}
