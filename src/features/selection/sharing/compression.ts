const FORMAT: CompressionFormat = 'deflate-raw';

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

export async function compress(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    return run(bytes, new CompressionStream(FORMAT));
}

export async function decompress(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    return run(bytes, new DecompressionStream(FORMAT));
}
