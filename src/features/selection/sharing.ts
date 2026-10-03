import { toSelectionDocument, type SelectionDocument } from './selectionDocument';

const FORMAT = 'deflate-raw';

async function run(input: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream) {
    const source = new ReadableStream<BufferSource>({
        start(controller) { controller.enqueue(input); controller.close(); },
    }).pipeThrough(stream);
    return new Uint8Array(await new Response(source).arrayBuffer());
}

const toBase64url = (bytes: Uint8Array) =>
    btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
        .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

const fromBase64url = (text: string) =>
    Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));

/** Throws when the browser has no CompressionStream. */
export async function encodeSelection(document: SelectionDocument): Promise<string> {
    const json = new TextEncoder().encode(JSON.stringify(toSelectionDocument(document)));
    return toBase64url(await run(json, new CompressionStream(FORMAT)));
}

/** null for anything that is not a valid payload (bad base64, bad deflate, bad UTF-8/JSON). */
export async function decodeSelection(param: string): Promise<SelectionDocument | null> {
    try {
        if (!/^[A-Za-z0-9_-]+$/.test(param)) return null;
        const bytes = await run(fromBase64url(param), new DecompressionStream(FORMAT));
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        return toSelectionDocument(JSON.parse(text));
    } catch {
        return null;
    }
}