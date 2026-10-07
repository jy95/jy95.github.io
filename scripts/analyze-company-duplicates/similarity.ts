import { normalizeCompanyName } from "./normalize";

type SimilarityMetrics = { jaro: number; containment: number; prefix: number };

const SIGNAL_RULES: ReadonlyArray<readonly [string, (metrics: SimilarityMetrics) => boolean]> = [
    ["very similar text", ({ jaro }) => jaro >= 0.9],
    ["all shorter-name tokens are contained", ({ containment }) => containment === 1],
    ["strong shared prefix", ({ prefix }) => prefix >= 0.75],
    ["partial token overlap", ({ containment }) => containment >= 0.5 && containment < 1],
];

function commonPrefixLength(left: string, right: string, limit = Infinity): number {
    const max = Math.min(left.length, right.length, limit);
    let length = 0;
    while (length < max && left[length] === right[length]) {
        length += 1;
    }
    return length;
}

/** First unmatched occurrence of `char` in text[start, end), or -1. */
function findUnmatched(text: string, char: string, start: number, end: number, used: boolean[]): number {
    for (let index = start; index < end; index += 1) {
        if (!used[index] && text.charAt(index) === char) return index;
    }
    return -1;
}

function jaroSimilarity(left: string, right: string): number {
    const maxDistance = Math.max(Math.floor(Math.max(left.length, right.length) / 2) - 1, 0);
    const rightUsed = new Array<boolean>(right.length).fill(false);
    const leftMatched: string[] = [];

    for (let i = 0; i < left.length; i += 1) {
        const char = left.charAt(i);
        const start = Math.max(0, i - maxDistance);
        const end = Math.min(i + maxDistance + 1, right.length);
        const match = findUnmatched(right, char, start, end, rightUsed);
        if (match === -1) continue;

        rightUsed[match] = true;
        leftMatched.push(char);
    }

    const matches = leftMatched.length;
    if (matches === 0) return 0;

    const rightMatched = right.split("").filter((_, index) => rightUsed[index]);
    const transpositions = leftMatched.filter((char, index) => char !== rightMatched[index]).length;

    return (
        matches / left.length +
        matches / right.length +
        (matches - transpositions / 2) / matches
    ) / 3;
}

export function jaroWinkler(left: string, right: string): number {
    if (left === right) return 1;

    const jaro = jaroSimilarity(left, right);
    const prefix = commonPrefixLength(left, right, 4);
    return jaro + prefix * 0.1 * (1 - jaro);
}

function tokens(value: string): Set<string> {
    return new Set(value.split(" ").filter(Boolean));
}

/** Share of the smaller token set that also appears in the other one. */
function tokenContainment(left: string, right: string): number {
    const leftTokens = tokens(left);
    const rightTokens = tokens(right);
    const smallest = Math.min(leftTokens.size, rightTokens.size);
    if (smallest === 0) return 0;

    const shared = [...leftTokens].filter(token => rightTokens.has(token)).length;
    return shared / smallest;
}

function prefixRatio(left: string, right: string): number {
    const shortest = Math.min(left.length, right.length);
    if (shortest === 0) return 0;

    return commonPrefixLength(left, right) / shortest;
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

    const metrics: SimilarityMetrics = {
        jaro: jaroWinkler(left, right),
        containment: tokenContainment(left, right),
        prefix: prefixRatio(left, right),
    };

    return {
        score: metrics.jaro * 0.65 + metrics.containment * 0.25 + metrics.prefix * 0.1,
        signals: SIGNAL_RULES
            .filter(([, applies]) => applies(metrics))
            .map(([label]) => label),
    };
}
