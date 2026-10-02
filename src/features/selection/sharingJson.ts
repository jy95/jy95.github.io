import { normalizeSelectionDocument } from './documentClassification';
import type { SelectionDocument } from './documentTypes';

export const MAX_DECOMPRESSED_SIZE = 256 * 1024;

export function serializeSelection(document: SelectionDocument): Uint8Array<ArrayBuffer> {
    const bytes = new TextEncoder().encode(JSON.stringify(normalizeSelectionDocument(document)));
    if (bytes.length > MAX_DECOMPRESSED_SIZE) throw new Error('tooLarge');
    return bytes;
}

export function deserializeSelection(bytes: Uint8Array): SelectionDocument {
    try { return normalizeSelectionDocument(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))); }
    catch { return normalizeSelectionDocument(null); }
}
