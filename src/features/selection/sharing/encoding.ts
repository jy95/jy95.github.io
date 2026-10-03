const FORMAT : CompressionFormat = 'deflate-raw';

async function run(
    input: Uint8Array<ArrayBuffer>,
    stream: CompressionStream | DecompressionStream
): Promise<Uint8Array<ArrayBuffer>> {
    const source = new ReadableStream<BufferSource>({
        start(controller) {
            controller.enqueue(input);
            controller.close();
        },
    }).pipeThrough(stream);

    return new Uint8Array(await new Response(source).arrayBuffer());
}

export const toBase64Url = (bytes: Uint8Array<ArrayBuffer>): string =>
    btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');

export const fromBase64Url = (text: string): Uint8Array<ArrayBuffer> =>
    Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0));

export async function compress(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    return run(bytes, new CompressionStream(FORMAT));
}

export async function decompress(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    return run(bytes, new DecompressionStream(FORMAT));
}