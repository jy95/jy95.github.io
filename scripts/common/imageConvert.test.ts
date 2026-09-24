import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sharpMock, resizeMock, webpMock, toFileMock } = vi.hoisted(() => {
    const toFileMock = vi.fn().mockResolvedValue(undefined);
    const webpMock = vi.fn(() => ({ toFile: toFileMock }));
    const resizeMock = vi.fn(() => ({ webp: webpMock, toFile: toFileMock }));
    const sharpMock = vi.fn(() => ({ resize: resizeMock, webp: webpMock, toFile: toFileMock }));
    return { sharpMock, resizeMock, webpMock, toFileMock };
});

vi.mock('sharp', () => ({ default: sharpMock }));

const { convertBufferToWebp } = await import('./imageConvert');

/**
 * Unit tests for the `convertBufferToWebp` image processing utility.
 * Verifies image resizing behavior, fit mode configurations, and error propagation.
 */
describe('convertBufferToWebp', () => {
    beforeEach(() => {
        sharpMock.mockClear();
        resizeMock.mockClear();
        webpMock.mockClear();
        toFileMock.mockClear().mockResolvedValue(undefined);
    });

    /**
     * Verifies that the image pipeline resizes the image when explicit width and height
     * options are supplied, applies WebP format conversion, and outputs to the specified path.
     */
    it('resizes when width/height are provided, then converts to webp', async () => {
        await convertBufferToWebp(Buffer.from('x'), '/tmp/out.webp', { width: 250, height: 250 });

        expect(sharpMock).toHaveBeenCalledWith(expect.any(Buffer));
        expect(resizeMock).toHaveBeenCalledWith(250, 250, { fit: 'inside' });
        expect(webpMock).toHaveBeenCalled();
        expect(toFileMock).toHaveBeenCalledWith('/tmp/out.webp');
    });

    /**
     * Verifies that custom `fit` strategies (e.g., `'cover'`) are properly forwarded
     * to the `sharp` resize configuration options.
     */
    it('respects a custom fit mode', async () => {
        await convertBufferToWebp(Buffer.from('x'), '/tmp/out.webp', { width: 100, height: 100, fit: 'cover' });
        expect(resizeMock).toHaveBeenCalledWith(100, 100, { fit: 'cover' });
    });

    /**
     * Verifies that the resize step is bypassed when neither width nor height is provided,
     * directly proceeding to WebP conversion and file output.
     */
    it('skips resizing entirely when no width or height is given', async () => {
        await convertBufferToWebp(Buffer.from('x'), '/tmp/out.webp');

        expect(resizeMock).not.toHaveBeenCalled();
        expect(webpMock).toHaveBeenCalled();
        expect(toFileMock).toHaveBeenCalledWith('/tmp/out.webp');
    });

    /**
     * Verifies that underlying file writing errors raised by Sharp are propagated up
     * the call stack without being swallowed.
     */
    it('propagates a sharp/toFile failure', async () => {
        toFileMock.mockRejectedValueOnce(new Error('bad image'));
        await expect(convertBufferToWebp(Buffer.from('x'), '/tmp/out.webp')).rejects.toThrow('bad image');
    });
});