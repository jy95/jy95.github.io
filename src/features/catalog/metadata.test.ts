import { describe, expect, it, vi } from 'vitest';
import { createTranslator } from 'next-intl';

// Keep Next.js navigation outside jsdom; metadata only needs pathname generation.
vi.mock('@/i18n/routing', () => ({
    routing: { locales: ['fr', 'en'], defaultLocale: 'fr' },
    getPathname: ({ locale, href }: { locale: string; href: string | { pathname: string; params: { id: string } } }) => {
        const pathname = typeof href === 'string' ? href : href.pathname.replace('[id]', href.params.id);
        return locale === 'fr' ? pathname : `/en${pathname}`;
    },
}));

import enMessages from '../../../messages/en.json';
import frMessages from '../../../messages/fr.json';
import { getPathname } from '@/i18n/routing';
import { entityDetailMetadata } from './metadata';

vi.mock('next-intl/server', () => ({
    getTranslations: async ({ locale }: { locale: 'fr' | 'en' }) => createTranslator({
        locale,
        messages: locale === 'en' ? enMessages : frMessages,
        namespace: 'detailMetadata',
    }),
}));

const found = { name: 'Example', count: 2, imagePath: '/companies/1/logo.webp' };
const pathnameFor = (locale: 'fr' | 'en') => getPathname({
    locale, href: { pathname: '/companies/[id]', params: { id: '1' } },
});

describe('entityDetailMetadata', () => {
    it.each(['fr', 'en', 'de'])('localizes dynamic details and preserves URLs, images and feeds (%s)', async (locale) => {
        const metadata = await entityDetailMetadata({ locale, entity: 'company', found, pathnameFor });
        expect(metadata.title).toBe('Example');
        expect(metadata.description).toBe(locale === 'en'
            ? 'Example on GamesPassionFR: 2 games developed or published.'
            : 'Example sur GamesPassionFR : 2 jeux développés ou édités.');
        expect(metadata.openGraph).toEqual({
            type: 'website', siteName: 'GamesPassionFR', title: 'Example | GamesPassionFR',
            url: locale === 'en' ? '/en/companies/1' : '/companies/1',
            locale: locale === 'en' ? 'en_US' : 'fr_FR',
            alternateLocale: [locale === 'en' ? 'fr_FR' : 'en_US'],
            description: metadata.description,
            images: [{ url: found.imagePath, alt: locale === 'en' ? 'Company artwork for Example' : 'Visuel de l’entreprise Example' }],
        });
        expect(metadata.alternates).toEqual({
            canonical: locale === 'en' ? '/en/companies/1' : '/companies/1',
            languages: { fr: '/companies/1', en: '/en/companies/1' },
            types: { 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' },
        });
    });

    it.each(['company', 'series', 'dlc'] as const)('noindexes missing %s records', async (entity) => {
        expect(await entityDetailMetadata({ locale: 'en', entity, found: undefined, pathnameFor }))
            .toEqual({ robots: { index: false, follow: false } });
    });

    it.each(['series', 'dlc'] as const)('uses the %s description and singular count', async (entity) => {
        const metadata = await entityDetailMetadata({ locale: 'en', entity, found: { ...found, count: 1 }, pathnameFor });
        expect(metadata.description).toBe(entity === 'series'
            ? 'Example series on GamesPassionFR: 1 game.'
            : 'DLCs for Example on GamesPassionFR: 1 DLC.');
    });
});

it.each([
    [0, '0 jeux développés ou édités'], [1, '1 jeu développé ou édité'], [2, '2 jeux développés ou édités'],
])('uses French company agreement for %s games', async (count, wording) => {
    const metadata = await entityDetailMetadata({ locale: 'fr', entity: 'company',
        found: { ...found, count: Number(count) }, pathnameFor });
    expect(metadata.description).toBe(`Example sur GamesPassionFR : ${wording}.`);
});
