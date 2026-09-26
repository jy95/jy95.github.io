export function normalizeCompanyName(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}