import { normalizeCompanyName } from "./normalize";

export function jaroWinkler(
    left: string,
    right: string
): number {
    if (left === right) {
        return 1;
    }

    if (!left.length || !right.length) {
        return 0;
    }

    const maxDistance = Math.max(
        Math.floor(Math.max(left.length, right.length) / 2) - 1,
        0
    );

    const leftMatches = new Array<boolean>(left.length).fill(false);
    const rightMatches = new Array<boolean>(right.length).fill(false);

    let matches = 0;

    for (let i = 0; i < left.length; i += 1) {
        const start = Math.max(0, i - maxDistance);
        const end = Math.min(i + maxDistance + 1, right.length);

        for (let j = start; j < end; j += 1) {
            if (rightMatches[j] || left[i] !== right[j]) {
                continue;
            }

            leftMatches[i] = true;
            rightMatches[j] = true;
            matches += 1;
            break;
        }
    }

    if (matches === 0) {
        return 0;
    }

    const leftMatched: string[] = [];
    const rightMatched: string[] = [];

    for (let i = 0; i < left.length; i += 1) {
        if (leftMatches[i]) {
            leftMatched.push(left[i]);
        }
    }

    for (let i = 0; i < right.length; i += 1) {
        if (rightMatches[i]) {
            rightMatched.push(right[i]);
        }
    }

    let transpositions = 0;

    for (let i = 0; i < leftMatched.length; i += 1) {
        if (leftMatched[i] !== rightMatched[i]) {
            transpositions += 1;
        }
    }

    const jaro =
        (
            matches / left.length +
            matches / right.length +
            (matches - transpositions / 2) / matches
        ) / 3;

    let prefix = 0;

    for (
        let i = 0;
        i < Math.min(4, left.length, right.length);
        i += 1
    ) {
        if (left[i] !== right[i]) {
            break;
        }

        prefix += 1;
    }

    return jaro + prefix * 0.1 * (1 - jaro);
}

function tokenContainment(
    left: string,
    right: string
): number {
    const leftTokens = new Set(left.split(" ").filter(Boolean));
    const rightTokens = new Set(right.split(" ").filter(Boolean));

    if (!leftTokens.size || !rightTokens.size) {
        return 0;
    }

    const smaller =
        leftTokens.size <= rightTokens.size
            ? leftTokens
            : rightTokens;

    const larger =
        leftTokens.size <= rightTokens.size
            ? rightTokens
            : leftTokens;

    let intersection = 0;

    for (const token of smaller) {
        if (larger.has(token)) {
            intersection += 1;
        }
    }

    return intersection / smaller.size;
}

function prefixRatio(
    left: string,
    right: string
): number {
    const length = Math.min(
        left.length,
        right.length
    );

    if (length === 0) {
        return 0;
    }

    let common = 0;

    while (
        common < length &&
        left[common] === right[common]
    ) {
        common += 1;
    }

    return common / length;
}

export function calculateSimilarity(
    leftName: string,
    rightName: string
): {
    score: number;
    signals: string[];
} {
    const left = normalizeCompanyName(leftName);
    const right = normalizeCompanyName(rightName);

    if (left === right) {
        return {
            score: 1,
            signals: ["normalized names are identical"],
        };
    }

    const jaro = jaroWinkler(left, right);
    const containment = tokenContainment(left, right);
    const prefix = prefixRatio(left, right);

    const score =
        jaro * 0.65 +
        containment * 0.25 +
        prefix * 0.10;

    const signals: string[] = [];

    if (jaro >= 0.9) {
        signals.push("very similar text");
    }

    if (containment === 1) {
        signals.push(
            "all shorter-name tokens are contained"
        );
    }

    if (prefix >= 0.75) {
        signals.push("strong shared prefix");
    }

    if (containment >= 0.5 && containment < 1) {
        signals.push("partial token overlap");
    }

    return {
        score,
        signals,
    };
}