const DEFAULT_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface DownloadImageOptions {
    /** Request timeout in milliseconds. Defaults to 10000ms (10s). */
    timeoutMs?: number;
    /** Custom User-Agent header string. Defaults to `DEFAULT_USER_AGENT`. */
    userAgent?: string;
}

export interface DownloadedImage {
    /** The raw binary buffer of the downloaded image. */
    buffer: Buffer;
    /** The MIME type of the image (e.g., 'image/png'), or `null` if header is missing. */
    contentType: string | null;
}

/**
 * Downloads an image via `fetch` with configurable timeout and User-Agent headers,
 * returning its raw bytes and Content-Type (excluding any charset parameter).
 *
 * Centralizes logic previously duplicated between `add-cover.ts` and
 * `backlog-cover-downloader.ts`.
 *
 * @param url - The direct URL of the image to download.
 * @param options - Configuration options for the fetch request.
 * @param options.timeoutMs - Time in milliseconds before the request aborts.
 * @param options.userAgent - The User-Agent string sent with the request headers.
 * @returns A promise that resolves to an object containing the image `buffer` and `contentType`.
 * @throws {Error} Throws an error if the HTTP response status is not OK (200-299) or if the request times out.
 */
export async function downloadImageBuffer(
    url: string,
    options: DownloadImageOptions = {}
): Promise<DownloadedImage> {
    const { timeoutMs = 10_000, userAgent = DEFAULT_USER_AGENT } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': userAgent },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawContentType = response.headers.get('content-type');
        const contentType = rawContentType ? rawContentType.split(';')[0].trim().toLowerCase() : null;
        const arrayBuffer = await response.arrayBuffer();

        return { buffer: Buffer.from(arrayBuffer), contentType };
    } finally {
        clearTimeout(timeoutId);
    }
}