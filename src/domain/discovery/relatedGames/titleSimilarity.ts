export function titleBigrams(title: string): string[] {
    const text = title
        .toLowerCase()
        .replace(/\p{P}+/gu, "")
        .replace(/\s+/g, " ")
        .trim();

    return Array.from({ length: Math.max(0, text.length - 1) }, (_, index) => text.slice(index, index + 2));
}

/** Sørensen–Dice coefficient; a repeated bigram only matches as often as it occurs on both sides. */
export function diceCoefficient(left: string[], right: string[]): number {
    if (left.length === 0 || right.length === 0) return 0;

    const unmatched = [...right];
    let shared = 0;

    for (const bigram of left) {
        const position = unmatched.indexOf(bigram);
        if (position === -1) continue;

        unmatched.splice(position, 1);
        shared += 1;
    }

    return (2 * shared) / (left.length + right.length);
}
