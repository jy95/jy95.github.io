import { fromBase64Url, toBase64Url } from './encoding';
import { compress, decompress } from './compression';
import { isSelectionDocument } from "@/domain/selection/validation";

import type { SelectionDocument } from "@/domain/selection/types";

/** Throws when the browser has no CompressionStream. */
export async function encodeSelection(document: SelectionDocument): Promise<string> {
    if (!isSelectionDocument(document)) throw new Error("invalid");
    const json = new TextEncoder().encode(JSON.stringify(document));
    const compressed = await compress(json);
    return toBase64Url(compressed);
}

/** null for anything that is not a valid payload (bad base64, bad deflate, bad UTF-8/JSON). */
export async function decodeSelection(param: string): Promise<SelectionDocument | null> {
    try {
        const compressed = fromBase64Url(param);
        const bytes = await decompress(compressed);
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        const value: unknown = JSON.parse(text);
        return isSelectionDocument(value) ? value : null;
    } catch {
        return null;
    }
}
