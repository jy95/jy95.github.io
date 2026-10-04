import { emptySelection } from '@/domain/selection/operations';
import { isSelectionDocument } from '@/domain/selection/validation';
import type { SelectionDocument } from '@/domain/selection/types';

export const SELECTION_STORAGE_KEY = 'gamespassionfr.selection.v1';

type SelectionReadResult =
    | { ok: true; document: SelectionDocument; invalid: boolean }
    | { ok: false };

function parseDocument(raw: string | null): SelectionReadResult {
    if (raw === null) return { ok: true, document: emptySelection(), invalid: false };
    try {
        const value: unknown = JSON.parse(raw);
        if (isSelectionDocument(value)) return { ok: true, document: value, invalid: false };
    } catch { /* Invalid data requires an explicit reset. */ }
    return { ok: true, document: emptySelection(), invalid: true };
}

/** Invalid documents are readable; unavailable storage is a read failure. */
export function readSelection(): SelectionReadResult {
    try {
        return parseDocument(window.localStorage.getItem(SELECTION_STORAGE_KEY));
    } catch {
        return { ok: false };
    }
}

export function writeSelection(document: SelectionDocument): boolean {
    if (!isSelectionDocument(document)) return false;
    try {
        window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
        return true;
    } catch {
        return false;
    }
}
