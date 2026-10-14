import { describe, it, expect, vi, beforeEach } from 'vitest';

const resolveGameDetails = vi.hoisted(() => vi.fn());
vi.mock('@/lib/gameDetails', () => ({ resolveGameDetails }));
vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr', 'en'], defaultLocale: 'fr' } }));
vi.mock('next-intl/server', () => ({
    getTranslations: async ({ namespace }: { namespace: string }) =>
        (key: string, values: Record<string, unknown>) => `${namespace}.${key}:${JSON.stringify(values)}`,
}));

import { gameDetailMetadata } from './metadata';

const game = { id: 'PL1', title: 'Some Game', imagePath: '/covers/PL1/cover.webp' };

describe('gameDetailMetadata', () => {
    beforeEach(() => {
        resolveGameDetails.mockReset();
    });

    it.each(['published', 'planning', 'backlog'])('uses the %s description template', async (source) => {
        resolveGameDetails.mockResolvedValue({ source, game });
        const metadata = await gameDetailMetadata('en', 'PL1');
        expect(metadata.title).toBe('Some Game | GamesPassionFR');
        expect(metadata.description).toBe(`detailMetadata.game.${source}:{"title":"Some Game"}`);
        expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ width: 1200, height: 630, alt: 'Some Game' })]);
        expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
        expect(metadata.openGraph).toMatchObject({ locale: 'en_US', alternateLocale: ['fr_FR'] });
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

    it('keeps a social fallback when artwork is missing', async () => {
        resolveGameDetails.mockResolvedValue({ source: 'published', game: { id: 'PL1', title: 'Étoile' } });
        const metadata = await gameDetailMetadata('fr', 'PL1');
        expect(JSON.stringify(metadata.openGraph?.images)).not.toContain('artwork=');
        expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ alt: 'Étoile', width: 1200, height: 630 })]);
    });

    it.each([undefined, 'throws'])('noindexes unknown or failing lookups (%s)', async (mode) => {
        if (mode) resolveGameDetails.mockRejectedValue(new Error('boom'));
        else resolveGameDetails.mockResolvedValue(undefined);
        expect((await gameDetailMetadata('en', 'nope')).robots).toEqual({ index: false, follow: false });
    });
});
