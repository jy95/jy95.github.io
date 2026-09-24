import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadImageBuffer } from './imageDownload';

/**
 * Creates a mock HTTP `Response` object for `fetch` testing.
 *
 * @param status - The HTTP status code to return. Defaults to `200`.
 * @param headersMap - Key-value pair map of response headers.
 * @param body - The array buffer representing the response body content.
 * @returns A mocked Fetch API response object with headers and `arrayBuffer` method.
 */
function makeMockResponse(status = 200, headersMap: Record<string, string> = {}, body = new ArrayBuffer(8)) {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: {
            get: (key: string) => {
                const lower = key.toLowerCase();
                for (const [k, v] of Object.entries(headersMap)) {
                    if (k.toLowerCase() === lower) return v;
                }
                return null;
            },
        },
        arrayBuffer: async () => body,
    };
}

/**
 * Unit test suite for `downloadImageBuffer`.
 * Tests network request handling, content-type parsing, default headers, and abort timeouts.
 */
describe('downloadImageBuffer', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    /**
     * Verifies that successful HTTP responses return the image content as a `Buffer`
     * alongside the extracted `contentType`.
     */
    it('returns the buffer and parsed content-type on success', async () => {
        const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
        (global.fetch as any).mockResolvedValue(makeMockResponse(200, { 'content-type': 'image/png' }, bytes));

        const result = await downloadImageBuffer('https://example.com/img.png');

        expect(result.buffer).toBeInstanceOf(Buffer);
        expect(result.buffer.length).toBe(4);
        expect(result.contentType).toBe('image/png');
    });

    /**
     * Verifies that charset directives are stripped from the `Content-Type` header
     * and the MIME type string is normalized to lowercase.
     */
    it('strips a charset suffix and lower-cases the content-type', async () => {
        (global.fetch as any).mockResolvedValue(
            makeMockResponse(200, { 'content-type': 'IMAGE/JPEG; charset=utf-8' })
        );

        const result = await downloadImageBuffer('https://example.com/img.jpg');
        expect(result.contentType).toBe('image/jpeg');
    });

    /**
     * Verifies that `contentType` resolves to `null` when the HTTP response header is absent.
     */
    it('returns null content-type when the header is missing', async () => {
        (global.fetch as any).mockResolvedValue(makeMockResponse(200));
        const result = await downloadImageBuffer('https://example.com/img');
        expect(result.contentType).toBeNull();
    });

    /**
     * Verifies that non-OK status codes (e.g., 404, 500) cause the function to throw an error with the status code.
     */
    it('throws with the HTTP status when the response is not ok', async () => {
        (global.fetch as any).mockResolvedValue(makeMockResponse(404));
        await expect(downloadImageBuffer('https://example.com/missing.jpg')).rejects.toThrow(
            'HTTP error! status: 404'
        );
    });

    /**
     * Verifies that requests include a standard fallback `User-Agent` header when none is explicitly provided.
     */
    it('sends a User-Agent header by default', async () => {
        (global.fetch as any).mockResolvedValue(makeMockResponse(200));
        await downloadImageBuffer('https://example.com/img.jpg');

        expect(global.fetch).toHaveBeenCalledWith(
            'https://example.com/img.jpg',
            expect.objectContaining({
                headers: expect.objectContaining({ 'User-Agent': expect.stringContaining('Mozilla') }),
            })
        );
    });

    /**
     * Verifies that custom `userAgent` values passed via options override the default header value.
     */
    it('allows overriding the User-Agent', async () => {
        (global.fetch as any).mockResolvedValue(makeMockResponse(200));
        await downloadImageBuffer('https://example.com/img.jpg', { userAgent: 'CustomBot/1.0' });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://example.com/img.jpg',
            expect.objectContaining({ headers: { 'User-Agent': 'CustomBot/1.0' } })
        );
    });

    /**
     * Verifies that requests abort and throw an `AbortError` when the designated timeout period expires.
     */
    it('aborts the request once the timeout elapses', async () => {
        (global.fetch as any).mockImplementation((_url: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
                init.signal?.addEventListener('abort', () => {
                    const err = new Error('Aborted');
                    err.name = 'AbortError';
                    reject(err);
                });
            })
        );

        const promise = downloadImageBuffer('https://example.com/slow.jpg', { timeoutMs: 5 });
        await expect(promise).rejects.toThrow('Aborted');
    });

    /**
     * Verifies that network-level rejections (e.g., DNS resolution or connection failures) are re-thrown properly.
     */
    it('propagates a network-level rejection from fetch', async () => {
        (global.fetch as any).mockRejectedValue(new Error('network down'));
        await expect(downloadImageBuffer('https://example.com/img.jpg')).rejects.toThrow('network down');
    });
});