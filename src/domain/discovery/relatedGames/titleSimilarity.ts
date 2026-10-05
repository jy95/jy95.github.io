const normalizeTitle = (title: string) =>
    title
        .toLowerCase()
        .replace(/\p{P}+/gu, "")
        .replace(/\s+/g, " ")
        .trim();

export function titleBigrams(title: string): string[] {
    const text = normalizeTitle(title);
    const bigrams: string[] = [];

    for (let start = 0; start < text.length - 1; start++) {
        bigrams.push(text.slice(start, start + 2));
    }
    return bigrams;
}

function countOccurrences(items: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
    return counts;
}

/** Sørensen–Dice coefficient; repeated bigrams only match as often as they occur on both sides. */
export function diceCoefficient(left: string[], right: string[]): number {
    if (left.length === 0 || right.length === 0) return 0;

    const available = countOccurrences(right);
    let shared = 0;

    for (const bigram of left) {
        const remaining = available.get(bigram) ?? 0;
        if (remaining === 0) continue;

        shared += 1;
        available.set(bigram, remaining - 1);
    }

    return (2 * shared) / (left.length + right.length);
}
