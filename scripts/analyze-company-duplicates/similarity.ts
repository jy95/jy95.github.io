import { normalizeCompanyName } from "./normalize";

type SimilarityMetrics = { jaro: number; containment: number; prefix: number };

const SIGNAL_RULES: ReadonlyArray<readonly [string, (metrics: SimilarityMetrics) => boolean]> = [
    ["very similar text", ({ jaro }) => jaro >= 0.9],
    ["all shorter-name tokens are contained", ({ containment }) => containment === 1],
    ["strong shared prefix", ({ prefix }) => prefix >= 0.75],
    ["partial token overlap", ({ containment }) => containment >= 0.5 && containment < 1],
];

function commonPrefixLength(a: string, b: string, limit = Infinity): number {
    const max = Math.min(a.length, b.length, limit);
    for (let i = 0; i < max; i++) {
        if (a[i] !== b[i]) return i;
    }
    return max;
}

function jaroSimilarity(a: string, b: string): number {
    const maxDist = Math.max(Math.floor(Math.max(a.length, b.length) / 2) - 1, 0);
    const bMatches = new Array(b.length).fill(false);
    const matches = [];

    for (let i = 0; i < a.length; i++) {
        const start = Math.max(0, i - maxDist);
        const end = Math.min(i + maxDist + 1, b.length);

        for (let j = start; j < end; j++) {
            if (!bMatches[j] && a[i] === b[j]) {
                bMatches[j] = true;
                matches.push({ a: i, b: j });
                break;
            }
        }
    }

    if (matches.length === 0) return 0;

    const transpositions = matches.filter(({ a: ai, b: bi }) => a[ai] !== b[bi]).length;
    const matchRatio = matches.length / a.length + matches.length / b.length;
    const transpositionRatio = (matches.length - transpositions / 2) / matches.length;

    return (matchRatio + transpositionRatio) / 3;
}

export function jaroWinkler(a: string, b: string): number {
    if (a === b) return 1;

    const jaro = jaroSimilarity(a, b);
    const prefix = commonPrefixLength(a, b, 4);
    return jaro + prefix * 0.1 * (1 - jaro);
}

function tokenSet(value: string): Set<string> {
    return new Set(value.split(/\s+/).filter(Boolean));
}

function tokenContainment(a: string, b: string): number {
    const aTokens = tokenSet(a);
    const bTokens = tokenSet(b);
    const smallest = Math.min(aTokens.size, bTokens.size);

    if (smallest === 0) return 0;

    let shared = 0;
    for (const token of aTokens) {
        if (bTokens.has(token)) shared++;
    }

    return shared / smallest;
}

function prefixRatio(a: string, b: string): number {
    const shortest = Math.min(a.length, b.length);
    return shortest === 0 ? 0 : commonPrefixLength(a, b) / shortest;
}

export function calculateSimilarity(leftName: string, rightName: string): {
    score: number;
    signals: string[];
} {
    const left = normalizeCompanyName(leftName);
    const right = normalizeCompanyName(rightName);

    if (left === right) {
        return { score: 1, signals: ["normalized names are identical"] };
    }

    const metrics = {
        jaro: jaroWinkler(left, right),
        containment: tokenContainment(left, right),
        prefix: prefixRatio(left, right),
    };

    const score = metrics.jaro * 0.65 + metrics.containment * 0.25 + metrics.prefix * 0.1;
    const signals = SIGNAL_RULES
        .filter(([, applies]) => applies(metrics))
        .map(([label]) => label);

    return { score, signals };
}
