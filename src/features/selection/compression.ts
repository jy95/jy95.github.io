export async function readBounded(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > limit) { await reader.cancel(); throw new Error('tooLarge'); }
            chunks.push(value);
        }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes;
}
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

export async function compressSelection(bytes: Uint8Array<ArrayBuffer>, limit: number): Promise<Uint8Array> {
    return readBounded(bytesStream(bytes).pipeThrough(createCompressionStream()), limit);
}

export async function decompressSelection(bytes: Uint8Array<ArrayBuffer>, limit: number): Promise<Uint8Array> {
    return readBounded(bytesStream(bytes).pipeThrough(createDecompressionStream()), limit);
}
