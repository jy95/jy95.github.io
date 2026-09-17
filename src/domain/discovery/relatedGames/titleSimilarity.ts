export function titleBigrams(title: string): string[] {
    const normalized = title
        .toLowerCase()
        .replace(/\p{P}+/gu, "")
        .replace(/\s+/g, " ")
        .trim();

    return Array.from({ length: Math.max(0, normalized.length - 1) }, (_, index) =>
        normalized.slice(index, index + 2)
    );
}

export function diceCoefficient(left: string[], right: string[]): number {
    if (left.length === 0 || right.length === 0) return 0;

    const rightCounts = new Map<string, number>();
    for (const bigram of right) rightCounts.set(bigram, (rightCounts.get(bigram) ?? 0) + 1);

    let intersection = 0;
    for (const bigram of left) {
        const count = rightCounts.get(bigram) ?? 0;
        if (count > 0) {
            intersection += 1;
            rightCounts.set(bigram, count - 1);
        }
    }

    return (2 * intersection) / (left.length + right.length);
}
