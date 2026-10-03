import type { SelectionDocument } from './documentTypes';
import { encodeBase64url, decodeBase64url } from './base64url';
import { compressSelection, decompressSelection } from './compression';
import { entriesParameter, type SelectionSearchParams } from './sharingQuery';
import { serializeSelection, deserializeSelection } from './sharingJson';
import { transportError, type SelectionTransportError } from './sharingErrors';

export type SharedSelection = { kind: 'absent' } | { kind: 'selection'; document: SelectionDocument } | { kind: 'error'; error: SelectionTransportError };

export async function selectionQuery(document: SelectionDocument): Promise<string> {
    const compressed = await compressSelection(serializeSelection(document));
    return new URLSearchParams({ entries: encodeBase64url(compressed) }).toString();
}

/** Decode only compressed selection links. */
export async function parseSharedSelection(params: SelectionSearchParams): Promise<SharedSelection> {
    try {
        const encoded = entriesParameter(params);
        if (encoded === null) return { kind: 'absent' };
        const decoded = await decompressSelection(decodeBase64url(encoded));
        return { kind: 'selection', document: deserializeSelection(decoded) };
    } catch (error) {
        return { kind: 'error', error: transportError(error) };
    }
}
