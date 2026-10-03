import {
    emptySelection,
    mergeSelections,
    toggleId,
    toSelectionDocument,
} from "@/domain/selection/operations"

import type {
    SelectionDocument,
    SelectionCategory,
} from "@/domain/selection/types";

export const SELECTION_STORAGE_KEY = 'gamespassionfr.selection.v1';

export type SelectionSnapshot = {
    document: SelectionDocument;
    hydrated: boolean;
    storageAvailable: boolean;
};

// Constant server snapshot: SSR and the first client render agree, so hydration is safe.
export const SERVER_SNAPSHOT: SelectionSnapshot = {
    document: emptySelection(),
    hydrated: false,
    storageAvailable: true,
};

let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

const parse = (raw: string | null) => {
    try {
        return toSelectionDocument(JSON.parse(raw ?? 'null'));
    } catch {
        return emptySelection();
    }
};

function publish(document: SelectionDocument, storageAvailable: boolean) {
    const unchanged =
        snapshot.hydrated &&
        snapshot.storageAvailable === storageAvailable &&
        JSON.stringify(snapshot.document) === JSON.stringify(document);

    if (unchanged) return; // keeps the snapshot reference stable
    snapshot = { document, hydrated: true, storageAvailable };
    listeners.forEach(listener => listener());
}

/** Reads storage; false (and storageAvailable=false) when storage is blocked. */
function load(): boolean {
    try {
        publish(parse(window.localStorage.getItem(SELECTION_STORAGE_KEY)), true);
        return true;
    } catch {
        publish(snapshot.document, false);
        return false;
    }
}

function onStorage(event: StorageEvent) {
    const ours =
        event.storageArea === window.localStorage &&
        (event.key === null || event.key === SELECTION_STORAGE_KEY);
    if (ours) publish(parse(event.newValue), true); // cross-tab sync
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

/** Re-reads storage first, so a stale tab never overwrites newer data. */
function mutate(update: (document: SelectionDocument) => SelectionDocument): boolean {
    if (!load()) return false;
    const next = update(snapshot.document);
    try {
        window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(next));
        publish(next, true);
        return true;
    } catch {
        publish(snapshot.document, false);
        return false;
    }
}

export const toggleSelection = ({ id, category }: { id: string; category: SelectionCategory }) =>
    mutate(document => toggleId(document, category, id));

export const addSelection = (addition: SelectionDocument) =>
    mutate(document => mergeSelections(document, toSelectionDocument(addition)));

export const clearSelection = () => mutate(emptySelection);