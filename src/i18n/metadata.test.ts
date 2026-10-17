import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr', 'en'], defaultLocale: 'fr' } }));

import { contentMetadata } from './metadata';

describe('complete content metadata', () => {
    it.each(['fr', 'en'] as const)('keeps canonical and Open Graph URLs together (%s)', locale => {
        const metadata = contentMetadata(locale, language => `/${language}/games/detail/a%2Fb`, 'Game', 'Description', '/covers/game.webp');
        expect(metadata.openGraph).toMatchObject({
            type: 'website', siteName: 'GamesPassionFR', title: 'Game', description: 'Description',
            url: metadata.alternates?.canonical, locale, alternateLocale: [locale === 'fr' ? 'en' : 'fr'],
            images: [{ url: '/covers/game.webp', alt: 'Game' }],
        });
        expect(metadata.alternates?.types).toEqual({ 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' });
        expect(metadata).not.toHaveProperty('twitter');
    });
});
