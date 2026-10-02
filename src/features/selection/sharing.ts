import type { SelectionDocument } from './documentTypes';
import { encodeBase64url, decodeBase64url } from './base64url';
import { compressSelection, decompressSelection } from './compression';
import { selectionParameter, MAX_ENCODED_SIZE } from './sharingQuery';
import { serializeSelection, deserializeSelection, MAX_DECOMPRESSED_SIZE } from './sharingJson';
import { transportError, type SelectionTransportError } from './sharingErrors';

export { MAX_ENCODED_SIZE } from './sharingQuery';
export { MAX_DECOMPRESSED_SIZE } from './sharingJson';
export type SharedSelection = { kind: 'absent' } | { kind: 'selection'; document: SelectionDocument } | { kind: 'error'; error: SelectionTransportError };

export async function selectionQuery(document: SelectionDocument): Promise<string> {
    const compressed = await compressSelection(serializeSelection(document), MAX_ENCODED_SIZE * 3 / 4);
    return new URLSearchParams({ selection: encodeBase64url(compressed) }).toString();
}

/** Decode only compressed selection links. */
export async function parseSharedSelection(params: URLSearchParams): Promise<SharedSelection> {
    try {
        const encoded = selectionParameter(params);
        if (encoded === null) return { kind: 'absent' };
        const decoded = await decompressSelection(decodeBase64url(encoded), MAX_DECOMPRESSED_SIZE);
        return { kind: 'selection', document: deserializeSelection(decoded) };
    } catch (error) {
        return { kind: 'error', error: transportError(error) };
    }
}
