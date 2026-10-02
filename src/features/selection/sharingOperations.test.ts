import { expect, it } from 'vitest';
import { encodeBase64url, decodeBase64url } from './base64url';
import { readBounded } from './gzip';
import { selectionParameter } from './sharingQuery';
import { deserializeSelection } from './sharingJson';
import { transportError } from './sharingErrors';

it('round-trips binary bytes with URL-safe base64 and no padding', () => {
    const bytes = Uint8Array.from([0, 255, 254, 128, 42]);
    const encoded = encodeBase64url(bytes);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeBase64url(encoded)).toEqual(bytes);
});
it('accepts only one valid selection parameter and ignores unrelated query keys', () => {
    expect(selectionParameter(new URLSearchParams('games=a'))).toBeNull();
    expect(selectionParameter(new URLSearchParams('selection=YWJj&games=a'))).toBe('YWJj');
    expect(() => selectionParameter(new URLSearchParams('selection=YWJj&selection=YWJj'))).toThrow('invalid');
    expect(() => selectionParameter(new URLSearchParams('selection=a'))).toThrow('invalid');
});
it('cancels oversized streams and releases the reader lock', async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(5)); }, cancel });
    await expect(readBounded(stream, 4)).rejects.toThrow('tooLarge');
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
});
it('reads chunks up to the inclusive limit and releases locks on stream errors', async () => {
    const stream = new ReadableStream<Uint8Array>({ start(controller) {
        controller.enqueue(Uint8Array.from([1, 2]));
        controller.enqueue(Uint8Array.from([3]));
        controller.close();
    } });
    expect(await readBounded(stream, 3)).toEqual(Uint8Array.from([1, 2, 3]));
    expect(stream.locked).toBe(false);
    const broken = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('broken')); } });
    await expect(readBounded(broken, 4)).rejects.toThrow('broken');
    expect(broken.locked).toBe(false);
});
it('rejects invalid UTF-8 and classifies unexpected transport errors', () => {
    expect(() => deserializeSelection(Uint8Array.from([0xff]))).toThrow();
    expect(transportError(new Error('unsupported'))).toBe('unsupported');
    expect(transportError(new Error('tooLarge'))).toBe('tooLarge');
    expect(transportError(new Error('compressionUnavailable'))).toBe('compressionUnavailable');
    expect(transportError(new Error('unexpected'))).toBe('invalid');
    expect(transportError(null)).toBe('invalid');
});
