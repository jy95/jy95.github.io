import { normalizeSelectionIds } from './selectionSlice';

/** A present but empty parameter is still a shared selection. */
export function parseSharedSelection(params: URLSearchParams): string[] | null {
    if (!params.has('games')) return null;
    return normalizeSelectionIds(params.getAll('games').flatMap(value => value.split(',')));
}

export function selectionQuery(ids: string[]): string {
    return new URLSearchParams({ games: normalizeSelectionIds(ids).join(',') }).toString();
}
