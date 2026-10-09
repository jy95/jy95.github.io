import { normalizeCompanyName } from "./normalize";
import { calculateSimilarity } from "./similarity";

import type {
    AmbiguousCandidateGroup,
    CompanyDuplicateAnalysisReport,
    CompanyGroup,
    CompanyRecord,
    ExactDuplicateGroup,
    SimilarityCandidate,
} from "./types";

const DEFAULT_FUZZY_SCORE = 0.85;
const DEFAULT_MIN_FUZZY_NAME_LENGTH = 5;

type AnalyzeOptions = {
    fuzzyScore?: number;
    minFuzzyNameLength?: number;
};

// Helper function to group items by a key
function groupBy<T>(values: T[], keySelector: (value: T) => string): Map<string, T[]> {
    const result = new Map<string, T[]>();

    for (const value of values) {
        const key = keySelector(value);
        result.set(key, [...(result.get(key) ?? []), value]);
    }

    return result;
}

// Find exact duplicate company names
function findExactDuplicates(companies: CompanyRecord[]): ExactDuplicateGroup[] {
    return [...groupBy(companies, company => company.name)]
        .filter(([, grouped]) => grouped.length > 1)
        .map(([name, grouped]) => ({ name, companies: grouped }));
}

// Create groups of companies with the same normalized name
function createCompanyGroups(companies: CompanyRecord[]): CompanyGroup[] {
    return [...groupBy(companies, company => normalizeCompanyName(company.name))]
        .map(([normalizedName, grouped]) => ({ normalizedName, companies: grouped }));
}

// Find groups where the same normalized name appears in different forms
function findNormalizedDuplicates(groups: CompanyGroup[]): CompanyGroup[] {
    return groups.filter(group =>
        new Set(group.companies.map(company => company.name)).size > 1
    );
}

// Find pairs of companies with similar names
function findSimilarPairs(
    groups: CompanyGroup[],
    fuzzyScore: number,
    minNameLength: number
): SimilarityCandidate[] {
    const candidates: SimilarityCandidate[] = [];

    for (let i = 0; i < groups.length; i++) {
        const left = groups[i];

        for (let j = i + 1; j < groups.length; j++) {
            const right = groups[j];

            if (Math.min(left.normalizedName.length, right.normalizedName.length) < minNameLength) {
                continue;
            }

            const { score, signals } = calculateSimilarity(
                left.companies[0].name,
                right.companies[0].name
            );

            if (score >= fuzzyScore) {
                candidates.push({ left, right, score, signals });
            }
        }
    }

    return candidates;
}

// Find connected components in the similarity graph
function findComponents(pairs: SimilarityCandidate[]): CompanyGroup[][] {
    const neighbors = new Map<CompanyGroup, Set<CompanyGroup>>();

    // Build adjacency list
    for (const { left, right } of pairs) {
        neighbors.set(left, new Set([...(neighbors.get(left) ?? []), right]));
        neighbors.set(right, new Set([...(neighbors.get(right) ?? []), left]));
    }

    const visited = new Set<CompanyGroup>();
    const components: CompanyGroup[][] = [];

    for (const start of neighbors.keys()) {
        if (visited.has(start)) continue;

        const component: CompanyGroup[] = [];
        const queue = [start];

        visited.add(start);

        while (queue.length > 0) {
            const current = queue.shift()!;

            component.push(current);

            for (const next of neighbors.get(current) ?? []) {
                if (!visited.has(next)) {
                    visited.add(next);
                    queue.push(next);
                }
            }
        }

        components.push(component);
    }

    return components;
}

// Helper to find max score in a group
const maxPairScore = (group: AmbiguousCandidateGroup): number =>
    Math.max(0, ...group.pairs.map(pair => pair.score));

export function analyzeCompanies(
    companies: CompanyRecord[],
    options: AnalyzeOptions = {}
): CompanyDuplicateAnalysisReport {
    const fuzzyScore = options.fuzzyScore ?? DEFAULT_FUZZY_SCORE;
    const minFuzzyNameLength = options.minFuzzyNameLength ?? DEFAULT_MIN_FUZZY_NAME_LENGTH;

    const groups = createCompanyGroups(companies);
    const candidates = findSimilarPairs(groups, fuzzyScore, minFuzzyNameLength);

    const aliases: SimilarityCandidate[] = [];
    const ambiguous: AmbiguousCandidateGroup[] = [];

    for (const component of findComponents(candidates)) {
        const members = new Set(component);
        const pairs = candidates.filter(candidate => members.has(candidate.left));

        if (component.length === 2) {
            aliases.push(...pairs);
        } else {
            ambiguous.push({ companies: component, pairs });
        }
    }

    // Sort results by score
    aliases.sort((a, b) => b.score - a.score);
    ambiguous.sort((a, b) => maxPairScore(b) - maxPairScore(a));

    const exactDuplicates = findExactDuplicates(companies);
    const normalizedDuplicates = findNormalizedDuplicates(groups);

    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        thresholds: { fuzzyScore, minFuzzyNameLength },
        companiesScanned: companies.length,
        summary: {
            exactDuplicateGroups: exactDuplicates.length,
            normalizedDuplicateGroups: normalizedDuplicates.length,
            aliasCandidates: aliases.length,
            ambiguousGroups: ambiguous.length,
        },
        exactDuplicates,
        normalizedDuplicates,
        aliasCandidates: aliases,
        ambiguousCandidates: ambiguous,
    };
}
