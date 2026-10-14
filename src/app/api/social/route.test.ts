// @vitest-environment node
import sharp from 'sharp';
import { describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
import { GET } from './route';

describe('social images', () => {
    it.each(['en', 'fr'])('returns an accessible 1200 by 630 PNG fallback (%s)', async locale => {
        const response = await GET(new Request(`https://example.com/api/social?locale=${locale}&title=${encodeURIComponent('Été & <星>')}&artwork=/covers/missing/cover.webp`));
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/png');
        const dimensions = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
        expect(dimensions).toMatchObject({ width: 1200, height: 630, format: 'png' });
    });
    it.each(['/seriescovers/1/cover.webp', '/companies/1/cover.webp', '/covers/../../README.md', 'https://example.com/image.png'])('handles artwork safely: %s', async artwork => {
        const response = await GET(new Request(`https://example.com/api/social?artwork=${encodeURIComponent(artwork)}`));
        expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1000);
    });
});
