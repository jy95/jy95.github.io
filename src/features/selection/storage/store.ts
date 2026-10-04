import { isSelectionDocument } from '@/domain/selection/validation';
import {
    emptySelection,
    mergeSelections,
    toggleId,
    removeId,
} from "@/domain/selection/operations"

import type {
    SelectionDocument,
    SelectionCategory,
} from "@/domain/selection/types";

import { readSelection, writeSelection, SELECTION_STORAGE_KEY } from './persistence';

export { SELECTION_STORAGE_KEY } from './persistence';

export type SelectionSnapshot = {
    document: SelectionDocument;
    hydrated: boolean;
    storageAvailable: boolean;
    invalid: boolean;
};

// Constant server snapshot: SSR and the first client render agree, so hydration is safe.
export const SERVER_SNAPSHOT: SelectionSnapshot = {
    document: emptySelection(),
    hydrated: false,
    storageAvailable: true,
    invalid: false,
};

let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function publish(document: SelectionDocument, storageAvailable: boolean, invalid = snapshot.invalid) {
    const unchanged =
        snapshot.hydrated &&
        snapshot.storageAvailable === storageAvailable &&
        snapshot.invalid === invalid &&
        JSON.stringify(snapshot.document) === JSON.stringify(document);

    if (unchanged) return; // keeps the snapshot reference stable
    snapshot = { document, hydrated: true, storageAvailable, invalid };
    listeners.forEach(listener => {
        listener();
    });
}

/** Reads storage; false (and storageAvailable=false) when storage is blocked. */
function load(): boolean {
    const stored = readSelection();
    if (!stored.ok) {
        publish(snapshot.document, false);
        return false;
    }
    publish(stored.document, true, stored.invalid);
    return true;
}

function onStorage(event: StorageEvent) {
    const ours =
        event.storageArea === window.localStorage &&
        (event.key === null || event.key === SELECTION_STORAGE_KEY);
    if (ours) load(); // Read current storage, including clear events.
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

/** Refreshes before mutation; localStorage provides no concurrent transaction guarantee. */
function mutate(update: (document: SelectionDocument) => SelectionDocument, reset = false): boolean {
    if (!load()) return false;
    if (snapshot.invalid && !reset) return false;
    const next = update(snapshot.document);
    if (!writeSelection(next)) {
        publish(snapshot.document, false);
        return false;
    }
    publish(next, true, false);
    return true;
}

export const toggleSelection = ({ id, category }: { id: string; category: SelectionCategory }) =>
    mutate(document => toggleId(document, category, id));

export const addSelection = (addition: SelectionDocument) =>
    isSelectionDocument(addition) && mutate(document => mergeSelections(document, addition));

export const removeSelection = ({ id, category }: { id: string; category: SelectionCategory }) =>
    mutate(document => removeId(document, category, id));

/** Explicit recovery also replaces invalid stored data. */
export const clearSelection = () => mutate(emptySelection, true);
