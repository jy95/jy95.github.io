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

type SimilarityClassification = {
    aliases: SimilarityCandidate[];
    ambiguous: AmbiguousCandidateGroup[];
};

type NeighborMap = Map<CompanyGroup, Set<CompanyGroup>>;

function groupBy<T>(
    values: T[],
    keySelector: (value: T) => string
): Map<string, T[]> {
    const result = new Map<string, T[]>();

    for (const value of values) {
        const key = keySelector(value);
        const group = result.get(key);

        if (group) {
            group.push(value);
        } else {
            result.set(key, [value]);
        }
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
    return groups.filter(
        group => new Set(group.companies.map(company => company.name)).size > 1
    );
}

function findSimilarPair(
    left: CompanyGroup,
    right: CompanyGroup,
    fuzzyScore: number,
    minNameLength: number
): SimilarityCandidate | undefined {
    const shorterLength = Math.min(
        left.normalizedName.length,
        right.normalizedName.length
    );

    if (shorterLength < minNameLength) {
        return undefined;
    }

    const { score, signals } = calculateSimilarity(
        left.companies[0].name,
        right.companies[0].name
    );

    if (score < fuzzyScore) {
        return undefined;
    }

    return { left, right, score, signals };
}

function findSimilarPairs(
    groups: CompanyGroup[],
    fuzzyScore: number,
    minNameLength: number
): SimilarityCandidate[] {
    const candidates: SimilarityCandidate[] = [];

    for (let index = 0; index < groups.length; index++) {
        const left = groups[index];

        for (const right of groups.slice(index + 1)) {
            const candidate = findSimilarPair(
                left,
                right,
                fuzzyScore,
                minNameLength
            );

            if (candidate) {
                candidates.push(candidate);
            }
        }
    }

    return candidates;
}

function addNeighbor(
    neighbors: NeighborMap,
    source: CompanyGroup,
    target: CompanyGroup
): void {
    const adjacent = neighbors.get(source) ?? new Set<CompanyGroup>();
    adjacent.add(target);
    neighbors.set(source, adjacent);
}

function buildNeighborMap(pairs: SimilarityCandidate[]): NeighborMap {
    const neighbors: NeighborMap = new Map();

    for (const { left, right } of pairs) {
        addNeighbor(neighbors, left, right);
        addNeighbor(neighbors, right, left);
    }

    return neighbors;
}

function collectComponent(
    start: CompanyGroup,
    neighbors: NeighborMap,
    visited: Set<CompanyGroup>
): CompanyGroup[] {
    const component = [start];
    visited.add(start);

    // The array grows while iterating, so it acts as a BFS queue.
    for (const current of component) {
        const adjacent = neighbors.get(current);

        if (!adjacent) {
            continue;
        }

        for (const next of adjacent) {
            if (visited.has(next)) {
                continue;
            }

            visited.add(next);
            component.push(next);
        }
    }

    return component;
}

/** Connected components of the "is similar to" relation. */
function findComponents(pairs: SimilarityCandidate[]): CompanyGroup[][] {
    const neighbors = buildNeighborMap(pairs);
    const visited = new Set<CompanyGroup>();
    const components: CompanyGroup[][] = [];

    for (const start of neighbors.keys()) {
        if (visited.has(start)) {
            continue;
        }

        components.push(collectComponent(start, neighbors, visited));
    }

    return components;
}

function findComponentPairs(
    component: CompanyGroup[],
    candidates: SimilarityCandidate[]
): SimilarityCandidate[] {
    const members = new Set(component);

    return candidates.filter(candidate => members.has(candidate.left));
}

function classifyComponent(
    component: CompanyGroup[],
    candidates: SimilarityCandidate[],
    result: SimilarityClassification
): void {
    const pairs = findComponentPairs(component, candidates);

    // Exactly two names means a plain alias pair; larger groups need review.
    if (component.length === 2) {
        result.aliases.push(...pairs);
        return;
    }

    result.ambiguous.push({ companies: component, pairs });
}

function classifyComponents(
    components: CompanyGroup[][],
    candidates: SimilarityCandidate[]
): SimilarityClassification {
    const result: SimilarityClassification = {
        aliases: [],
        ambiguous: [],
    };

    for (const component of components) {
        classifyComponent(component, candidates, result);
    }

    return result;
}

function maxPairScore(group: AmbiguousCandidateGroup): number {
    return Math.max(0, ...group.pairs.map(pair => pair.score));
}

function sortClassification(result: SimilarityClassification): void {
    result.aliases.sort((a, b) => b.score - a.score);
    result.ambiguous.sort((a, b) => maxPairScore(b) - maxPairScore(a));
}

export function analyzeCompanies(
    companies: CompanyRecord[],
    options: AnalyzeOptions = {}
): CompanyDuplicateAnalysisReport {
    const fuzzyScore = options.fuzzyScore ?? DEFAULT_FUZZY_SCORE;
    const minFuzzyNameLength =
        options.minFuzzyNameLength ?? DEFAULT_MIN_FUZZY_NAME_LENGTH;

    const groups = createCompanyGroups(companies);
    const candidates = findSimilarPairs(
        groups,
        fuzzyScore,
        minFuzzyNameLength
    );

    const classification = classifyComponents(
        findComponents(candidates),
        candidates
    );

    sortClassification(classification);

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
            aliasCandidates: classification.aliases.length,
            ambiguousGroups: classification.ambiguous.length,
        },
        exactDuplicates,
        normalizedDuplicates,
        aliasCandidates: classification.aliases,
        ambiguousCandidates: classification.ambiguous,
    };
}