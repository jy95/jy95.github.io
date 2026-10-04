import { useSyncExternalStore } from 'react';
import type { SelectionCategory } from "@/domain/selection/types";
import {
    getSelectionSnapshot,
    SERVER_SNAPSHOT,
    subscribeSelection,
} from './store';

/** Whole-document subscription, for pages. */
export const usePersonalSelection = () =>
    useSyncExternalStore(subscribeSelection, getSelectionSnapshot, () => SERVER_SNAPSHOT);

/** Re-renders only when this identifier flips. Use in lists. */
export const useIsSelected = (id: string, category: SelectionCategory) =>
    useSyncExternalStore(
        subscribeSelection,
        () => getSelectionSnapshot().document[category].includes(id),
        () => false
    );

export const useSelectionWritable = () =>
    useSyncExternalStore(
        subscribeSelection,
        () => {
            const snap = getSelectionSnapshot();
            return snap.hydrated && snap.storageAvailable && !snap.invalid;
        },
        () => false
    );