import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTranslator } from 'next-intl';

vi.mock('@/i18n/metadataImage', () => ({ metadataImage: async (url: string, alt: string) => ({ url, alt }) }));

import enMessages from '../../../../messages/en.json';
import frMessages from '../../../../messages/fr.json';

const resolveGameDetails = vi.hoisted(() => vi.fn());
vi.mock('@/lib/gameDetails', () => ({ resolveGameDetails }));
vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr', 'en'], defaultLocale: 'fr' } }));
vi.mock('next-intl/server', () => ({
    getTranslations: async ({ locale, namespace }: { locale: 'fr' | 'en'; namespace: 'detailMetadata.game' | 'detailMetadata.images' }) => createTranslator({
        locale, messages: locale === 'en' ? enMessages : frMessages, namespace,
    }),
}));

import { gameDetailMetadata } from './metadata';

const game = { id: 'PL1', title: 'Some Game', imagePath: '/covers/PL1/cover.webp' };

describe('gameDetailMetadata', () => {
    beforeEach(() => {
        resolveGameDetails.mockReset();
    });

    it.each(['published', 'planning', 'backlog'] as const)('uses the %s description template', async (source) => {
        resolveGameDetails.mockResolvedValue({ source, game });
        const metadata = await gameDetailMetadata('en', 'PL1');
        expect(metadata.title).toBe('Some Game');
        expect(metadata.description).toBe(enMessages.detailMetadata.game[source].replace('{title}', game.title));
        expect(metadata.openGraph?.images).toEqual([{ url: '/covers/PL1/cover.webp', alt: 'Game cover for Some Game' }]);
    });

    it.each(['fr', 'en'])('preserves feed links alongside canonical and hreflang URLs (%s)', async (locale) => {
        resolveGameDetails.mockResolvedValue({ source: 'published', game });
        const { alternates } = await gameDetailMetadata(locale, 'PL1');
        expect(alternates?.canonical).toBe(`/${locale}/games/detail/PL1`);
        expect(alternates?.languages).toEqual({ fr: '/fr/games/detail/PL1', en: '/en/games/detail/PL1' });
        expect(alternates?.types).toEqual({
            'application/rss+xml': '/rss.xml',
            'application/feed+json': '/feed.json',
        });
    });

    it('uses French descriptions', async () => {
        resolveGameDetails.mockResolvedValue({ source: 'published', game });
        const metadata = await gameDetailMetadata('fr', 'PL1');
        expect(metadata.description).toBe(frMessages.detailMetadata.game.published.replace('{title}', game.title));
    });

    it('falls back to French for an unsupported locale and encodes identifiers', async () => {
        resolveGameDetails.mockResolvedValue({ source: 'published', game });
        const metadata = await gameDetailMetadata('de', 'a/b');
        expect(metadata.alternates?.canonical).toBe('/fr/games/detail/a%2Fb');
    });

    it.each([undefined, 'throws'])('noindexes unknown or failing lookups (%s)', async (mode) => {
        if (mode) resolveGameDetails.mockRejectedValue(new Error('boom'));
        else resolveGameDetails.mockResolvedValue(undefined);
        expect((await gameDetailMetadata('en', 'nope')).robots).toEqual({ index: false, follow: false });
    });
});
