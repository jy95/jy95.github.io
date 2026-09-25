import { describe, it, expect } from 'vitest';
import { extensionFromContentType } from './mimeTypes';

describe('extensionFromContentType', () => {
    it('maps every known MIME type to its extension', () => {
        expect(extensionFromContentType('image/jpeg')).toBe('jpg');
        expect(extensionFromContentType('image/png')).toBe('png');
        expect(extensionFromContentType('image/webp')).toBe('webp');
        expect(extensionFromContentType('image/gif')).toBe('gif');
    });

    it('falls back to "jpg" by default for an unrecognized MIME type', () => {
        expect(extensionFromContentType('image/bmp')).toBe('jpg');
    });

    it('falls back to "jpg" by default when contentType is null', () => {
        expect(extensionFromContentType(null)).toBe('jpg');
    });

    it('respects a custom fallback for an unrecognized MIME type', () => {
        expect(extensionFromContentType('image/tiff', 'png')).toBe('png');
    });

    it('respects a custom fallback when contentType is null', () => {
        expect(extensionFromContentType(null, 'png')).toBe('png');
    });

    it('is case-sensitive (an unrecognized case variant falls back)', () => {
        expect(extensionFromContentType('IMAGE/JPEG')).toBe('jpg');
    });

    it('treats an empty string as unrecognized and uses the fallback', () => {
        expect(extensionFromContentType('')).toBe('jpg');
        expect(extensionFromContentType('', 'gif')).toBe('gif');
    });
});
