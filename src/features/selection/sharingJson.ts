import { normalizeSelectionDocument } from './documentClassification';
import type { SelectionDocument } from './documentTypes';

export function serializeSelection(document: SelectionDocument): Uint8Array<ArrayBuffer> {
    const bytes = new TextEncoder().encode(JSON.stringify(normalizeSelectionDocument(document)));
    return bytes;
}

export function deserializeSelection(bytes: Uint8Array): SelectionDocument {
    try { return normalizeSelectionDocument(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))); }
    catch { return normalizeSelectionDocument(null); }
}
