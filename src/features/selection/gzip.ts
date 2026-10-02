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

export async function compressSelection(bytes: Uint8Array<ArrayBuffer>, limit: number): Promise<Uint8Array> {
    if (typeof CompressionStream === 'undefined') throw new Error('compressionUnavailable');
    return readBounded(bytesStream(bytes).pipeThrough(new CompressionStream('gzip')), limit);
}

export async function decompressSelection(bytes: Uint8Array<ArrayBuffer>, limit: number): Promise<Uint8Array> {
    if (typeof DecompressionStream === 'undefined') throw new Error('compressionUnavailable');
    return readBounded(bytesStream(bytes).pipeThrough(new DecompressionStream('gzip')), limit);
}
