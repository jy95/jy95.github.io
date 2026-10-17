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
    { section: 'backlog', en: 'Game backlog candidates', fr: 'Jeux en attente de vidéos' },
    { section: 'companies', en: 'Game developers and publishers', fr: 'Développeurs et éditeurs de jeux' },
    { section: 'links', en: 'YouTube, Discord and social links', fr: 'YouTube, Discord et réseaux sociaux' },
    { section: 'tier', en: 'Game tier lists', fr: 'Classements de jeux vidéo' },
    { section: 'tierGames', en: 'Published Games Tier List', fr: 'Classement des jeux publiés' },
    { section: 'tierBacklog', en: 'Backlog Tier List', fr: 'Classement des jeux en attente' },
    { section: 'tierTests', en: 'Reviewed Games Tier List', fr: 'Classement des jeux testés' },
    { section: 'dlcs', en: 'Game DLC catalog', fr: 'Catalogue des DLC de jeux' },
    { section: 'series', en: 'Video game series', fr: 'Séries de jeux vidéo' },
    { section: 'games', en: 'Video game catalog', fr: 'Catalogue de jeux vidéo' },
    { section: 'planning', en: 'Upcoming game coverage', fr: 'Prochaines vidéos de jeux' },
    { section: 'tests', en: 'Game Reviews', fr: 'Tests de jeux vidéo' },
    { section: 'stats', en: 'Game catalog statistics', fr: 'Statistiques du catalogue de jeux' },
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
                expect(String(metadata.title).match(/GamesPassionFR/g)).toHaveLength(1);
                expect(metadata).not.toHaveProperty('twitter');
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
        expect(metadata.title).toBe('Catalogue de jeux vidéo | GamesPassionFR');
        expect(metadata.alternates?.canonical).toBe('/games/random');
    });

    it('uses French metadata for an unsupported locale', async () => {
        const unknown = staticSectionMetadata('de', 'games');
        const french = staticSectionMetadata('fr', 'games');

        expect(unknown).toEqual(french);
    });
});
