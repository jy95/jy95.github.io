export function hasAllGenres(targetGenres: Set<number>, candidateGenres?: number[]): boolean {
    if (targetGenres.size === 0 || !candidateGenres?.length) return false;

    const uniqueCandidateGenres = new Set(candidateGenres);
    return [...targetGenres].every((genre) => uniqueCandidateGenres.has(genre));
}
