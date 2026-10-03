import { compress, decompress, fromBase64Url, toBase64Url } from './encoding';
import { toSelectionDocument } from "@/domain/selection/operations";

import type { SelectionDocument } from "@/domain/selection/types";

/** Throws when the browser has no CompressionStream. */
export async function encodeSelection(document: SelectionDocument): Promise<string> {
    const json = new TextEncoder().encode(JSON.stringify(toSelectionDocument(document)));
    const compressed = await compress(json);
    return toBase64Url(compressed);
}

/** null for anything that is not a valid payload (bad base64, bad deflate, bad UTF-8/JSON). */
export async function decodeSelection(param: string): Promise<SelectionDocument | null> {
    try {
        const compressed = fromBase64Url(param);
        const bytes = await decompress(compressed);
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        return toSelectionDocument(JSON.parse(text));
    } catch {
        return null;
    }
}