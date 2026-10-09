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

const SERVER_SNAPSHOT: SelectionSnapshot = {
    document: emptySelection(),
    hydrated: false,
    storageAvailable: true,
    invalid: false,
};

let snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function hasChanged(
    doc: SelectionDocument,
    storageAvailable: boolean,
    invalid: boolean
): boolean {
    return (
        snapshot.document !== doc ||
        snapshot.storageAvailable !== storageAvailable ||
        snapshot.invalid !== invalid
    );
}

function publish(
    doc: SelectionDocument,
    storageAvailable: boolean,
    invalid: boolean
) {
    if (!hasChanged(doc, storageAvailable, invalid)) return;

    snapshot = { document: doc, hydrated: true, storageAvailable, invalid };
    listeners.forEach(listener => listener());
}

function load(): boolean {
    const stored = readSelection();
    const doc = stored.ok ? stored.document : snapshot.document;
    
    publish(doc, stored.ok, stored.invalid);
    return stored.ok;
}

export function subscribeSelection(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        window.addEventListener('storage', (e: StorageEvent) => {
            if (e.storageArea === window.localStorage && 
                (e.key === null || e.key === SELECTION_STORAGE_KEY)) {
                load();
            }
        });
        load();
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
}

export const getSelectionSnapshot = () => snapshot;

function mutate(update: (doc: SelectionDocument) => SelectionDocument, reset = false): boolean {
    if (!load()) return false;
    if (snapshot.invalid && !reset) return false;

    const next = update(snapshot.document);
    const success = writeSelection(next);
    
    publish(
        success ? next : snapshot.document,
        success,
        false
    );
    
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
