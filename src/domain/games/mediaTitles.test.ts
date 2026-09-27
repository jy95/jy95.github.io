import { findMediaMetadata, getMediaMetadata } from './mediaTitles';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/api/games/games.json', async importOriginal => {
    const original = await importOriginal<{ default: object[] }>();
    return {
        default: [...original.default, { title: 'Custom cover', videoId: 'custom-cover-id', coverFile: 'alternate.jpg' }],
    };
});

describe('media metadata sources', () => {
    it('searches only the selected source', async () => {
        expect(await getMediaMetadata('games', 'videoId', 'RMgDUMubFsM')).toBeUndefined();
        expect(await getMediaMetadata('tests', 'videoId', 'RMgDUMubFsM')).toEqual({
            title: 'Nova Drift', imagePath: '/testscovers/RMgDUMubFsM/cover.webp',
        });
    });

    it('keeps source priority for repeated IDs', async () => {
        expect(await getMediaMetadata('dlcs', 'videoId', 'FO8cYct2Bkw')).toEqual({
            title: 'Batman: Arkham Knight - Red Hood Story Pack', imagePath: '/covers/FO8cYct2Bkw/cover.webp',
        });
        expect(await findMediaMetadata('videoId', 'FO8cYct2Bkw')).toEqual(
            await getMediaMetadata('pastPlanning', 'videoId', 'FO8cYct2Bkw'),
        );
    });

    it('uses the custom cover filename', async () => {
        expect(await getMediaMetadata('games', 'videoId', 'custom-cover-id')).toEqual({
            title: 'Custom cover', imagePath: '/covers/custom-cover-id/alternate.jpg',
        });
    });
});
