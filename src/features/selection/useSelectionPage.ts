import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSharedSelection } from './useSharedSelection';
import { useSelectionShare } from './useSelectionShare';
import { useSelectionCatalogue } from './useSelectionCatalogue';
import { useSelectionActions } from './useSelectionActions';
import { hasUnimportedEntries } from './resolveCatalogue';
import type { SelectionEntry } from './catalogue';
import { useSelectionBrowse } from './useSelectionBrowse';
import type { SelectionPageModel } from './selectionModels';

export function useSelectionPage(catalogue: SelectionEntry[]): SelectionPageModel {
    const params = useSearchParams();
    const decoded = useSharedSelection(params);
    const sharing = useSelectionShare(JSON.stringify(params.getAll('entries')));
    const resolved = useSelectionCatalogue(catalogue, decoded);
    const actions = useSelectionActions(resolved.entries, sharing.share);
    const { entries, ids } = resolved;
    const browse = useSelectionBrowse(entries);

    const canImport = useMemo(
        () => hasUnimportedEntries(entries, resolved.personalDocument),
        [entries, resolved.personalDocument],
    );

    const decodeError = decoded.kind === 'error' ? decoded.error : null;
    const decoding = decoded.kind === 'processing';

    const shared = decoded.kind !== 'absent';
    const hasEntries = entries.length > 0;
    const encoding = sharing.state.kind === 'processing';

    return {
        results: { ...browse, decodeError, hasEntries, shared, onDetail: actions.setDetail },
        actions: {
            shared, hasEntries, hasSelection: ids.length > 0, canImport, encoding,
            onImport: actions.importSelection, onClear: actions.openClear, onShare: actions.shareSelection,
        },
        status: {
            shared, decodeError, decoding, encoding,
            loading: !resolved.hydrated || decoding,
            storageAvailable: resolved.storageAvailable,
            count: entries.length, unavailable: resolved.unavailable,
        },
        dialogs: {
            detail: actions.detail, closeDetail: actions.closeDetail,
            share: sharing.state, closeShare: sharing.close,
            clearOpen: actions.clearOpen, closeClear: actions.closeClear, confirmClear: actions.confirmClear,
        },
    };
}
