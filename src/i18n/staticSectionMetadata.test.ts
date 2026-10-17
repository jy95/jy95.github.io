import { describe, expect, it, vi } from 'vitest';
import { staticSectionMetadata } from './staticSectionMetadata';

// Keep Next.js navigation outside jsdom; metadata only needs pathname generation.
vi.mock('@/i18n/routing', () => ({
    routing: { locales: ['fr', 'en'], defaultLocale: 'fr' },
    getPathname: ({ locale, href }: { locale: string; href: string | { pathname: string; params: { id: string } } }) => {
        const pathname = typeof href === 'string' ? href : href.pathname.replace('[id]', href.params.id);
        return locale === 'fr' ? pathname : `/en${pathname}`;
    },
}));

const sections = [
    { section: 'backlog', en: 'Backlog', fr: 'En attente' },
    { section: 'companies', en: 'Companies', fr: 'Entreprises' },
    { section: 'links', en: 'Links', fr: 'Liens' },
    { section: 'tier', en: 'Tier lists', fr: 'Classements' },
    { section: 'tierGames', en: 'Published Games Tier List', fr: 'Classement des jeux publiés' },
    { section: 'tierBacklog', en: 'Backlog Tier List', fr: 'Classement des jeux en attente' },
    { section: 'tierTests', en: 'Game Tests Tier List', fr: 'Classement des tests' },
    { section: 'dlcs', en: 'DLCs', fr: 'DLCs' },
    { section: 'series', en: 'Series', fr: 'Séries' },
    { section: 'games', en: 'Games', fr: 'Jeux' },
    { section: 'planning', en: 'Calendar', fr: 'Planning' },
    { section: 'tests', en: 'Game Reviews', fr: 'Tests de jeux' },
    { section: 'stats', en: 'Statistics', fr: 'Statistiques' },
] as const;

describe('static section metadata', () => {
    for (const { section, en, fr } of sections) {
        it(`uses localized metadata for ${en}`, async () => {
            const english = staticSectionMetadata('en', section);
            const french = staticSectionMetadata('fr', section);

            expect(english.title).toBe(`${en} | GamesPassionFR`);
            expect(french.title).toBe(`${fr} | GamesPassionFR`);
            for (const [metadata, locale, alternate] of [[english, 'en', 'fr'], [french, 'fr', 'en']] as const) {
                expect(metadata.openGraph).toMatchObject({
                    type: 'website', siteName: 'GamesPassionFR', title: metadata.title,
                    description: metadata.description, url: metadata.alternates?.canonical,
                    locale, alternateLocale: [alternate],
                });
                expect(metadata.openGraph).not.toHaveProperty('images');
            }
            expect(english.description).toBeTruthy();
            expect(french.description).toBeTruthy();
            expect(english.description).not.toBe(french.description);
        });
    }

    it.each(['fr', 'en'])('includes canonical, languages and feeds (%s)', (locale) => {
        expect(staticSectionMetadata(locale, 'games').alternates).toEqual({
            canonical: locale === 'fr' ? '/games' : '/en/games',
            languages: { fr: '/games', en: '/en/games' },
            types: { 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' },
        });
    });

    it('noindexes stateful selection and random navigation utilities', () => {
        expect(staticSectionMetadata('en', 'selection').robots).toEqual({ index: false, follow: true });
        expect(staticSectionMetadata('fr', 'games', '/games/random').robots).toEqual({ index: false, follow: true });
        expect(staticSectionMetadata('fr', 'games').robots).toBeUndefined();
    });

    it('uses the selection title without adding a brand suffix', () => {
        expect(staticSectionMetadata('en', 'selection').title).toBe('My GamesPassionFR Selection');
    });

    it('preserves games metadata on the random route with its own canonical URL', () => {
        const metadata = staticSectionMetadata('fr', 'games', '/games/random');
        expect(metadata.title).toBe('Jeux | GamesPassionFR');
        expect(metadata.alternates?.canonical).toBe('/games/random');
    });

    it('uses French metadata for an unsupported locale', async () => {
        const unknown = staticSectionMetadata('de', 'games');
        const french = staticSectionMetadata('fr', 'games');

        expect(unknown).toEqual(french);
    });
});
