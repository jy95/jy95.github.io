import { validateSelection } from './documentValidation';
import type { SelectionDocument } from './documentTypes';

export const MAX_DECOMPRESSED_SIZE = 256 * 1024;

export function serializeSelection(document: SelectionDocument): Uint8Array<ArrayBuffer> {
    const bytes = new TextEncoder().encode(JSON.stringify(validateSelection(document)));
    if (bytes.length > MAX_DECOMPRESSED_SIZE) throw new Error('tooLarge');
    return bytes;
}

export function deserializeSelection(bytes: Uint8Array): SelectionDocument {
    return validateSelection(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
}
