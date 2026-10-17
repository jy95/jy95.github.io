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
        expect(metadata.title).toBe('Example | GamesPassionFR');
        expect(metadata.description).toBe(locale === 'en'
            ? 'Example: 2 games developed or published in the GamesPassionFR catalog.'
            : 'Example : 2 jeux développés ou édités dans le catalogue GamesPassionFR.');
        expect(metadata.openGraph).toEqual({
            type: 'website', siteName: 'GamesPassionFR', title: 'Example',
            description: metadata.description,
            url: locale === 'en' ? '/en/companies/1' : '/companies/1',
            locale: locale === 'en' ? 'en' : 'fr',
            alternateLocale: [locale === 'en' ? 'fr' : 'en'],
            images: [{ url: found.imagePath, alt: found.name }],
        });
        expect(metadata.alternates).toEqual({
            canonical: locale === 'en' ? '/en/companies/1' : '/companies/1',
            languages: { fr: '/companies/1', en: '/en/companies/1' },
            types: { 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' },
        });
    });

    it.each(['fr', 'en'] as const)('interpolates long names and ICU counts without truncation (%s)', async locale => {
        const name = 'A Very Long Company or Series Name & More '.repeat(5).trim();
        const messages = locale === 'en' ? enMessages : frMessages;
        const t = createTranslator({ locale, messages, namespace: 'detailMetadata' });
        for (const entity of ['company', 'series', 'dlc'] as const) {
            for (const count of [0, 1, 2]) {
                const metadata = await entityDetailMetadata({ locale, entity, found: { ...found, name, count }, pathnameFor });
                expect(metadata.title).toBe(`${name} | GamesPassionFR`);
                expect(metadata.description).toBe(t(entity, { name, count }));
                expect(metadata.description).toContain(name);
                expect(metadata.description).toContain(String(count));
                expect(metadata.description).not.toMatch(/[{}]/);
                expect(String(metadata.title).match(/GamesPassionFR/g)).toHaveLength(1);
                expect(metadata.openGraph).toMatchObject({ title: name, description: metadata.description, url: metadata.alternates?.canonical });
                expect(metadata.openGraph?.images).toEqual([{ url: found.imagePath, alt: name }]);
                expect(metadata).not.toHaveProperty('twitter');
            }
        }
        const singular = t('company', { name: 'Example', count: 1 });
        expect(singular).toContain(locale === 'en' ? '1 game developed or published' : '1 jeu développé ou édité');
        expect(t('company', { name: 'Example', count: 2 })).toContain(locale === 'en' ? '2 games developed or published' : '2 jeux développés ou édités');
    });
    it.each(['company', 'series', 'dlc'] as const)('noindexes missing %s records', async (entity) => {
        expect(await entityDetailMetadata({ locale: 'en', entity, found: undefined, pathnameFor }))
            .toEqual({ robots: { index: false, follow: false } });
    });

    it.each(['series', 'dlc'] as const)('uses the %s description and singular count', async (entity) => {
        const metadata = await entityDetailMetadata({ locale: 'en', entity, found: { ...found, count: 1 }, pathnameFor });
        expect(metadata.description).toBe(entity === 'series'
            ? 'Example: 1 game from this video game series in the GamesPassionFR catalog.'
            : 'Example: 1 DLC in the GamesPassionFR catalog.');
    });
});
