import type { GameFilters } from '@/types/gamesFilters';
import type { SelectionEntry } from './catalogue';
import type { SelectionKind } from './documentTypes';
import type { SelectionTransportError } from './sharingErrors';
import type { ShareState } from './useSelectionShare';

export type SelectionBrowseModel = {
    filters: GameFilters;
    updateFilters: (changes: Partial<GameFilters>) => void;
    kind: SelectionKind;
    setKind: (kind: SelectionKind) => void;
    visibleEntries: SelectionEntry[];
    hasMore: boolean;
    loadMore: () => void;
};

export type SelectionResultsModel = SelectionBrowseModel & {
    decodeError: SelectionTransportError | null;
    hasEntries: boolean;
    shared: boolean;
    onDetail: (entry: SelectionEntry) => void;
};

export type SelectionActionsModel = {
    shared: boolean;
    hasEntries: boolean;
    hasSelection: boolean;
    canImport: boolean;
    encoding: boolean;
    onImport: () => void;
    onClear: () => void;
    onShare: () => void;
};

export type SelectionStatusModel = {
    shared: boolean;
    decodeError: SelectionTransportError | null;
    decoding: boolean;
    encoding: boolean;
    loading: boolean;
    storageAvailable: boolean;
    count: number;
    unavailable: number;
};

export type SelectionDialogModel = {
    detail: SelectionEntry | null;
    closeDetail: () => void;
    share: ShareState;
    closeShare: () => void;
    clearOpen: boolean;
    closeClear: () => void;
    confirmClear: () => void;
};

export type SelectionContentModel = {
    results: SelectionResultsModel;
    actions: SelectionActionsModel;
    status: SelectionStatusModel;
};

export type SelectionPageModel = SelectionContentModel & { dialogs: SelectionDialogModel };
