const MIME_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

/**
 * Determines the appropriate file extension for a given HTTP `Content-Type` header.
 *
 * Maps known image MIME types (e.g., `'image/png'`) to their corresponding file extension (`'png'`).
 * If the provided MIME type is not recognized or is `null`, it returns the specified fallback extension.
 *
 * @param contentType - The MIME type string extracted from the `Content-Type` header (e.g., `'image/jpeg'`), or `null` if missing.
 * @param fallback - The default file extension to use if the `contentType` is `null` or unmapped. Defaults to `'jpg'`.
 * @returns The matching file extension (without leading dot).
 */
export function extensionFromContentType(contentType: string | null, fallback = 'jpg'): string {
    return contentType ? (MIME_TO_EXTENSION[contentType] ?? fallback) : fallback;
}