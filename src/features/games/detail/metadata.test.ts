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
    beforeEach(() => resolveGameDetails.mockReset());

    it.each(['published', 'planning', 'backlog'])('uses the %s description template', async (source) => {
        resolveGameDetails.mockResolvedValue({ source, game });
        const metadata = await gameDetailMetadata('en', 'PL1');
        expect(metadata.title).toBe('Some Game | GamesPassionFR');
        expect(metadata.description).toBe(`detailMetadata.game.${source}:{"title":"Some Game"}`);
        expect(metadata.openGraph?.images).toEqual([{ url: '/covers/PL1/cover.webp', alt: 'Some Game' }]);
    });

    it('always prefixes canonical and hreflang URLs with the locale', async () => {
        resolveGameDetails.mockResolvedValue({ source: 'published', game });
        const { alternates } = await gameDetailMetadata('fr', 'PL1');
        expect(alternates?.canonical).toBe('/fr/games/detail/PL1');
        expect(alternates?.languages).toEqual({ fr: '/fr/games/detail/PL1', en: '/en/games/detail/PL1' });
    });

    it.each([undefined, 'throws'])('noindexes unknown or failing lookups (%s)', async (mode) => {
        if (mode) resolveGameDetails.mockRejectedValue(new Error('boom'));
        else resolveGameDetails.mockResolvedValue(undefined);
        expect((await gameDetailMetadata('en', 'nope')).robots).toEqual({ index: false, follow: false });
    });
});