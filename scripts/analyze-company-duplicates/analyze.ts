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

function groupBy<T>(values: T[], keySelector: (value: T) => string): Map<string, T[]> {
    const result = new Map<string, T[]>();

    for (const value of values) {
        const key = keySelector(value);
        result.set(key, [...(result.get(key) ?? []), value]);
    }

    return result;
}

function findExactDuplicates(companies: CompanyRecord[]): ExactDuplicateGroup[] {
    return [...groupBy(companies, company => company.name)]
        .filter(([, grouped]) => grouped.length > 1)
        .map(([name, grouped]) => ({ name, companies: grouped }));
}

function createCompanyGroups(companies: CompanyRecord[]): CompanyGroup[] {
    return [...groupBy(companies, company => normalizeCompanyName(company.name))]
        .map(([normalizedName, grouped]) => ({ normalizedName, companies: grouped }));
}

/** Same normalized name, but written in more than one way. */
function findNormalizedDuplicates(groups: CompanyGroup[]): CompanyGroup[] {
    return groups.filter(group => new Set(group.companies.map(company => company.name)).size > 1);
}

function findSimilarPairs(groups: CompanyGroup[], fuzzyScore: number, minNameLength: number): SimilarityCandidate[] {
    return groups.flatMap((left, index) =>
        groups.slice(index + 1).flatMap(right => {
            const shorterLength = Math.min(left.normalizedName.length, right.normalizedName.length);
            if (shorterLength < minNameLength) return [];

            const { score, signals } = calculateSimilarity(left.companies[0].name, right.companies[0].name);
            if (score < fuzzyScore) return [];

            return [{ left, right, score, signals }];
        })
    );
}

/** Connected components (breadth-first) of the "is similar to" relation. */
function findComponents(pairs: SimilarityCandidate[]): CompanyGroup[][] {
    const neighbors = new Map<CompanyGroup, Set<CompanyGroup>>();
    const link = (from: CompanyGroup, to: CompanyGroup) =>
        neighbors.set(from, (neighbors.get(from) ?? new Set()).add(to));

    for (const { left, right } of pairs) {
        link(left, right);
        link(right, left);
    }

    const visited = new Set<CompanyGroup>();
    const components: CompanyGroup[][] = [];

    for (const start of neighbors.keys()) {
        if (visited.has(start)) continue;

        visited.add(start);
        const component = [start];

        // The array grows while we iterate: this is the BFS queue.
        for (const current of component) {
            for (const next of neighbors.get(current) ?? []) {
                if (visited.has(next)) continue;
                visited.add(next);
                component.push(next);
            }
        }

        components.push(component);
    }

    return components;
}

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

        // Exactly two names means a plain alias pair; anything bigger needs a human.
        if (component.length === 2) {
            aliases.push(...pairs);
        } else {
            ambiguous.push({ companies: component, pairs });
        }
    }

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
