import { describe, expect, it, vi } from 'vitest';

import en from '../../messages/en.json';
import fr from '../../messages/fr.json';

vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr', 'en'], defaultLocale: 'fr' } }));

import { contentMetadata } from './metadata';

describe('metadata copy', () => {
    it.each([en, fr])('keeps links metadata independent of external platforms', messages => {
        expect(JSON.stringify(messages.pageMetadata.links)).not.toMatch(/YouTube|Discord|Twitter|Facebook|Twitch/i);
    });
    it.each([{ locale: 'en', messages: en }, { locale: 'fr', messages: fr }])(
        'describes content without media-format wording ($locale)',
        ({ messages }) => {
            for (const namespace of ['watchMetadata', 'pageMetadata', 'detailMetadata'] as const) {
                // Keep the subject terms “video game” and “jeu vidéo”, including plurals.
                const copy = JSON.stringify(messages[namespace])
                    .replace(/\bvideo games?\b|\bjeux? vidéo\b/gi, '');
                expect(copy).not.toMatch(/\b(?:vid[eé]os?|playlists?|gameplay|walkthroughs?|watch(?:ing)?|regardez|coverage|covered)\b/i);
            }
        },
    );
});

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
