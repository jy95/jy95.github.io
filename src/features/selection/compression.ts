function bytesStream(bytes: Uint8Array<ArrayBuffer>): ReadableStream<BufferSource> {
    return new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } });
}

const COMPRESSION_FORMAT: CompressionFormat = 'deflate-raw';

/** Only constructor failures indicate unsupported browser compression. */
function createCompressionStream() {
    try { return new CompressionStream(COMPRESSION_FORMAT); }
    catch { throw new Error('compressionUnavailable'); }
}

function createDecompressionStream() {
    try { return new DecompressionStream(COMPRESSION_FORMAT); }
    catch { throw new Error('compressionUnavailable'); }
}

export async function compressSelection(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
    return new Uint8Array(await new Response(bytesStream(bytes).pipeThrough(createCompressionStream())).arrayBuffer());
}

export async function decompressSelection(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
    return new Uint8Array(await new Response(bytesStream(bytes).pipeThrough(createDecompressionStream())).arrayBuffer());
}
