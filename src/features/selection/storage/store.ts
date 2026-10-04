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

export const SERVER_SNAPSHOT: SelectionSnapshot = {
    document: emptySelection(),
    hydrated: false,
    storageAvailable: true,
    invalid: false,
};

let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function publish(document: SelectionDocument, storageAvailable: boolean, invalid = snapshot.invalid) {
    const isUnchanged =
        snapshot.hydrated &&
        snapshot.storageAvailable === storageAvailable &&
        snapshot.invalid === invalid &&
        JSON.stringify(snapshot.document) === JSON.stringify(document);

    if (isUnchanged) return;

    snapshot = { document, hydrated: true, storageAvailable, invalid };
    listeners.forEach(listener => listener());
}

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
    const isTargetStorage = event.storageArea === window.localStorage &&
        (event.key === null || event.key === SELECTION_STORAGE_KEY);
    
    if (isTargetStorage) load();
}

export function subscribeSelection(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        window.addEventListener('storage', onStorage);
        load();
    }
    
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            window.removeEventListener('storage', onStorage);
        }
    };
}

export const getSelectionSnapshot = () => snapshot;

function mutate(update: (doc: SelectionDocument) => SelectionDocument, reset = false): boolean {
    if (!load() || (snapshot.invalid && !reset)) return false;

    const next = update(snapshot.document);
    const success = writeSelection(next);

    publish(success ? next : snapshot.document, success, success ? false : false);
    return success;
}

type CategoryItem = { id: string; category: SelectionCategory };

export const toggleSelection = ({ id, category }: CategoryItem) =>
    mutate(doc => toggleId(doc, category, id));

export const removeSelection = ({ id, category }: CategoryItem) =>
    mutate(doc => removeId(doc, category, id));

export const addSelection = (addition: SelectionDocument) =>
    isSelectionDocument(addition) && mutate(doc => mergeSelections(doc, addition));

export const clearSelection = () => mutate(emptySelection, true);