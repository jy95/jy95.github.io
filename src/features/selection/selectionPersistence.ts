import { SELECTION_CATEGORIES, emptySelection, type SelectionCategory, type SelectionDocument } from './documentTypes';
import { selectionIds } from './identifiers';
import { normalizeSelectionDocument } from './documentClassification';
import { mergeSelections } from './documentMerge';
import { toggleSelectionIdentifier } from './documentOperations';
import { isSelectionStorageEvent } from './storageOperations';
import { parseStoredSelection, SELECTION_STORAGE_KEY } from './storageFormat';

export type SelectionSnapshot = {
    document: SelectionDocument;
    ids: string[];
    hydrated: boolean;
    storageAvailable: boolean;
};

const serverSnapshot: SelectionSnapshot = { document: emptySelection(), ids: [], hydrated: false, storageAvailable: true };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();

const sameDocument = (a: SelectionDocument, b: SelectionDocument) =>
    SELECTION_CATEGORIES.every(category => {
        const left = a[category];
        const right = b[category];
        return left.length === right.length && left.every((id, index) => id === right[index]);
    });

function publish(document: SelectionDocument, storageAvailable: boolean) {
    if (snapshot.hydrated && snapshot.storageAvailable === storageAvailable && sameDocument(snapshot.document, document)) return;
    snapshot = { document, ids: selectionIds(document), hydrated: true, storageAvailable };
    listeners.forEach(listener => {
        listener();
    });
}

function read(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        publish(parseStoredSelection(window.localStorage.getItem(SELECTION_STORAGE_KEY)), true);
        return true;
    } catch {
        publish(snapshot.document, false);
        return false;
    }
}

function onStorage(event: StorageEvent) {
    if (isSelectionStorageEvent(event)) publish(parseStoredSelection(event.newValue), true);
}

export function subscribeSelection(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        window.addEventListener('storage', onStorage);
        read();
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
}

export function getSelectionSnapshot() { return snapshot; }

export function getSelectionServerSnapshot() { return serverSnapshot; }

/** Read before every mutation, including operations before any consumer mounts. */
function mutate(update: (document: SelectionDocument) => SelectionDocument): boolean {
    if (!read()) return false;
    const document = update(snapshot.document);
    try {
        window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
        publish(document, true);
        return true;
    } catch {
        publish(snapshot.document, false);
        return false;
    }
}

export function toggleSelection({ id, category }: { id: string; category: SelectionCategory }) {
    return mutate(document => toggleSelectionIdentifier(document, id, category));
}
export function addSelection(addition: SelectionDocument) {
    return mutate(document => mergeSelections(document, normalizeSelectionDocument(addition)));
}
export function clearSelection() { return mutate(() => emptySelection()); }
