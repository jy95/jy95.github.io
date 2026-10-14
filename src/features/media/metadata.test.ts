import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
const loaders = vi.hoisted(() => ({ published: vi.fn(), dlcs: vi.fn() }));
vi.mock('@/lib/gamesData', () => ({ loadPublishedGames: loaders.published, loadDlcGroups: loaders.dlcs, toPublishedGame: (game: object) => game }));
vi.mock('next-intl/server', () => ({ getTranslations: async ({ locale }: { locale: string }) => (key: string, values?: { title: string }) => `${locale}:${key}:${values?.title ?? ''}` }));
import { mediaMetadata } from './metadata';

describe('media metadata', () => {
    beforeEach(() => { loaders.published.mockResolvedValue([]); loaders.dlcs.mockResolvedValue([]); });
    it.each(['playlist', 'video'] as const)('resolves Unicode %s subjects locally', async kind => {
        loaders.published.mockResolvedValue([{ title: '星のÉté', playlistId: 'PL1', videoId: 'V1', imagePath: '/covers/one/cover.webp' }]);
        const id = kind === 'playlist' ? 'PL1' : 'V1';
        for (const locale of ['en', 'fr']) {
            const metadata = await mediaMetadata(locale, kind, id);
            expect(metadata.description).toBe(`${locale}:${kind}Description:星のÉté`);
            expect(metadata.alternates?.canonical).toBe(`${locale === 'en' ? '/en' : ''}/${kind}/${id}`);
            expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
        }
    });
    it.each(['playlist', 'video'] as const)('uses honest %s fallback for missing subjects or failing lookups', async kind => {
        expect((await mediaMetadata('en', kind, 'missing')).description).toBe(`en:${kind}FallbackDescription:`);
        loaders.published.mockRejectedValue(new Error('unavailable'));
        expect((await mediaMetadata('fr', kind, 'missing')).description).toBe(`fr:${kind}FallbackDescription:`);
    });
});
