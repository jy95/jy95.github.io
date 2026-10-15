import { expect, it } from 'vitest';
import sharp from 'sharp';

import { metadataImage } from './metadataImage';

it.each(['/companies/1/cover.webp', '/seriescovers/1/cover.webp'])(
    'describes the actual available artwork: %s', async url => {
        const actual = await sharp(`public${url}`).metadata();
        expect(await metadataImage(url, 'Artwork')).toEqual({
            url, alt: 'Artwork', width: actual.width, height: actual.height, type: `image/${actual.format}`,
        });
    },
);

it.each(['/missing-cover.webp', '/next.svg', '/../package.json', 'https://example.com/image.png'])(
    'omits unavailable, unsupported or nonlocal artwork: %s', async url => {
        expect(await metadataImage(url, 'Artwork')).toBeUndefined();
    },
);
