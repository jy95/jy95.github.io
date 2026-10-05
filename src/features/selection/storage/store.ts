import { isSelectionDocument } from '@/domain/selection/validation';
import { emptySelection, mergeSelections, toggleId, removeId } from "@/domain/selection/operations";
import type { SelectionDocument, SelectionCategory } from "@/domain/selection/types";
import { readSelection, writeSelection, SELECTION_STORAGE_KEY } from './persistence';

export { SELECTION_STORAGE_KEY };

export type SelectionSnapshot = {
    document: SelectionDocument;
    hydrated: boolean;
    storageAvailable: boolean;
    invalid: boolean;
};

type SnapshotState = Omit<SelectionSnapshot, 'hydrated'>;

export const SERVER_SNAPSHOT: SelectionSnapshot = {
    document: emptySelection(),
    hydrated: false,
    storageAvailable: true,
    invalid: false,
};

let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function isUnchanged(next: SnapshotState): boolean {
    return snapshot.hydrated
        && snapshot.storageAvailable === next.storageAvailable
        && snapshot.invalid === next.invalid
        && JSON.stringify(snapshot.document) === JSON.stringify(next.document);
}

/** Keeps the snapshot reference stable unless something really changed. */
function publish(next: SnapshotState) {
    if (isUnchanged(next)) return;

    snapshot = { ...next, hydrated: true };
    listeners.forEach(listener => { listener(); });
}

/** Re-reads storage. Returns false (and flags storage as unavailable) when it cannot be read. */
function load(): boolean {
    const stored = readSelection();

    if (stored.ok) {
        publish({ document: stored.document, storageAvailable: true, invalid: stored.invalid });
    } else {
        publish({ document: snapshot.document, storageAvailable: false, invalid: snapshot.invalid });
    }
    return stored.ok;
}

function onStorage(event: StorageEvent) {
    const concernsSelection = event.key === null || event.key === SELECTION_STORAGE_KEY;
    if (event.storageArea === window.localStorage && concernsSelection) load();
}

export function subscribeSelection(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        window.addEventListener('storage', onStorage);
        load();
    }

    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
}

export const getSelectionSnapshot = () => snapshot;

/** Invalid stored data is only replaced when `reset` is explicitly requested. */
function mutate(update: (doc: SelectionDocument) => SelectionDocument, reset = false): boolean {
    if (!load()) return false;
    if (snapshot.invalid && !reset) return false;

    const next = update(snapshot.document);
    if (writeSelection(next)) {
        publish({ document: next, storageAvailable: true, invalid: false });
        return true;
    }

    publish({ document: snapshot.document, storageAvailable: false, invalid: false });
    return false;
}

type CategoryItem = { id: string; category: SelectionCategory };

export const toggleSelection = ({ id, category }: CategoryItem) =>
    mutate(doc => toggleId(doc, category, id));

export const removeSelection = ({ id, category }: CategoryItem) =>
    mutate(doc => removeId(doc, category, id));

export const addSelection = (addition: SelectionDocument) =>
    isSelectionDocument(addition) && mutate(doc => mergeSelections(doc, addition));

export const clearSelection = () => mutate(emptySelection, true);
