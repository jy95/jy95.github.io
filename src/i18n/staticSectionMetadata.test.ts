import { generateMetadata as rootMetadata } from '@/app/[locale]/layout';
import { generateMetadata as backlogMetadata } from '@/app/[locale]/backlog/layout';
import { generateMetadata as linksMetadata } from '@/app/[locale]/links/layout';
import { generateMetadata as companiesMetadata } from '@/app/[locale]/companies/layout';
import { generateMetadata as companyMetadata } from '@/app/[locale]/companies/[id]/layout';
import { generateMetadata as seriesMetadata } from '@/app/[locale]/games/series/layout';
import { generateMetadata as dlcsMetadata } from '@/app/[locale]/games/dlcs/layout';
import { generateMetadata as randomMetadata } from '@/app/[locale]/games/random/layout';
import { generateMetadata as tierMetadata } from '@/app/[locale]/tier/layout';
import { generateMetadata as tierGamesMetadata } from '@/app/[locale]/tier/games/layout';
import { generateMetadata as tierBacklogMetadata } from '@/app/[locale]/tier/backlog/layout';
import { generateMetadata as tierTestsMetadata } from '@/app/[locale]/tier/tests/layout';
import { generateMetadata as playlistMetadata } from '@/app/[locale]/playlist/[id]/layout';
import { generateMetadata as videoMetadata } from '@/app/[locale]/video/[id]/layout';
import { generateMetadata as gamesMetadata } from '@/app/[locale]/games/layout';
import { generateMetadata as planningMetadata } from '@/app/[locale]/planning/layout';
import { generateMetadata as testsMetadata } from '@/app/[locale]/tests/layout';
import { generateMetadata as statsMetadata } from '@/app/[locale]/stats/layout';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr', 'en'] } }));
vi.mock('next/root-params', () => ({ locale: () => Promise.resolve('fr') }));
vi.mock('@/providers/ThemeProvider', () => ({ ThemeProvider: () => null }));
vi.mock('@/providers/StoreProvider', () => ({ default: () => null }));
vi.mock('@/components/dashboard/DashboardAppProvider', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));

const sections = [
    {
        generate: backlogMetadata, en: 'Backlog', fr: 'Backlog',
        enDescription: 'Browse the game backlog for the GamesPassionFR YouTube channel.',
        frDescription: 'Parcourez le backlog de jeux de la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: linksMetadata, en: 'Links', fr: 'Liens',
        enDescription: 'Find links related to the GamesPassionFR YouTube channel.',
        frDescription: 'Retrouvez les liens liés à la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: companiesMetadata, en: 'Companies', fr: 'Entreprises',
        enDescription: 'Browse game developers and publishers with the games associated with each company on the GamesPassionFR YouTube channel.',
        frDescription: 'Parcourez les développeurs et éditeurs de jeux ainsi que les jeux associés à chaque entreprise sur la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: companyMetadata, en: 'Company Games', fr: 'Jeux de l’entreprise',
        enDescription: 'Explore games by this developer or publisher in the GamesPassionFR collection.',
        frDescription: 'Découvrez les jeux de ce développeur ou éditeur dans le catalogue GamesPassionFR.',
    },
    {
        generate: seriesMetadata, en: 'Game Series', fr: 'Séries de jeux',
        enDescription: 'Explore game series in the GamesPassionFR collection.',
        frDescription: 'Explorez les séries de jeux du catalogue GamesPassionFR.',
    },
    {
        generate: dlcsMetadata, en: 'DLCs', fr: 'Contenus additionnels',
        enDescription: 'Explore downloadable content and expansions in the GamesPassionFR collection.',
        frDescription: 'Découvrez les contenus additionnels et extensions du catalogue GamesPassionFR.',
    },
    {
        generate: randomMetadata, en: 'Random Game', fr: 'Jeu aléatoire',
        enDescription: 'Discover a random game video or playlist from GamesPassionFR.',
        frDescription: 'Découvrez une vidéo ou une playlist de jeu au hasard sur GamesPassionFR.',
    },
    {
        generate: tierMetadata, en: 'Tier Lists', fr: 'Tier lists',
        enDescription: 'Explore tier lists grouping and ranking games, backlog entries, and tests related to the GamesPassionFR YouTube channel.',
        frDescription: 'Explorez les tier lists qui regroupent et classent les jeux, les entrées du backlog et les tests liés à la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: tierGamesMetadata, en: 'Completed Games Tier List', fr: 'Classement des jeux terminés',
        enDescription: 'Explore the GamesPassionFR tier list of completed games.',
        frDescription: 'Découvrez le classement des jeux terminés de GamesPassionFR.',
    },
    {
        generate: tierBacklogMetadata, en: 'Backlog Tier List', fr: 'Classement du backlog',
        enDescription: 'Explore the GamesPassionFR backlog tier list.',
        frDescription: 'Découvrez le classement du backlog de GamesPassionFR.',
    },
    {
        generate: tierTestsMetadata, en: 'Game Reviews Tier List', fr: 'Classement des tests de jeux',
        enDescription: 'Explore the GamesPassionFR tier list of reviewed games.',
        frDescription: 'Découvrez le classement des jeux testés de GamesPassionFR.',
    },
    {
        generate: playlistMetadata, en: 'Game Playlist', fr: 'Playlist de jeu',
        enDescription: 'Watch a GamesPassionFR game playlist.',
        frDescription: 'Regardez une playlist de jeu de GamesPassionFR.',
    },
    {
        generate: videoMetadata, en: 'Game Video', fr: 'Vidéo de jeu',
        enDescription: 'Watch a GamesPassionFR game video.',
        frDescription: 'Regardez une vidéo de jeu de GamesPassionFR.',
    },
    {
        generate: gamesMetadata, en: 'Games', fr: 'Jeux',
        enDescription: 'Browse games, series, and DLCs published on the GamesPassionFR YouTube channel.',
        frDescription: 'Parcourez les jeux, séries et contenus additionnels publiés sur la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: planningMetadata, en: 'Calendar', fr: 'Planning',
        enDescription: 'See upcoming games to be published on the GamesPassionFR YouTube channel.',
        frDescription: 'Découvrez les prochains jeux qui seront publiés sur la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: testsMetadata, en: 'Game Reviews', fr: 'Tests de jeux',
        enDescription: 'Explore game reviews on the GamesPassionFR YouTube channel.',
        frDescription: 'Découvrez les tests de jeux sur la chaîne YouTube GamesPassionFR.',
    },
    {
        generate: statsMetadata, en: 'Statistics', fr: 'Statistiques',
        enDescription: 'Explore statistics for the GamesPassionFR YouTube channel.',
        frDescription: 'Explorez les statistiques de la chaîne YouTube GamesPassionFR.',
    },
];

describe('static section metadata', () => {
    for (const { generate, en, fr, enDescription, frDescription } of sections) {
        it(`uses localized metadata for ${en}`, async () => {
            const english = await generate({ params: Promise.resolve({ locale: 'en' }) });
            const french = await generate({ params: Promise.resolve({ locale: 'fr' }) });

            expect(english.title).toBe(`${en} | GamesPassionFR`);
            expect(french.title).toBe(`${fr} | GamesPassionFR`);
            expect(english.description).toBe(enDescription);
            expect(french.description).toBe(frDescription);
        });
    }

    it('uses French metadata for an unsupported locale', async () => {
        const unknown = await gamesMetadata({ params: Promise.resolve({ locale: 'de' }) });
        const french = await gamesMetadata({ params: Promise.resolve({ locale: 'fr' }) });

        expect(unknown).toEqual(french);
    });

    it('keeps the root feed alternates for both locales', async () => {
        for (const [locale, description] of [
            ['en', 'Browse the GamesPassionFR game collection.'],
            ['fr', 'Catalogue des jeux de GamesPassionFR.'],
        ] as const) {
            const metadata = await rootMetadata({
                params: Promise.resolve({ locale }),
                children: null,
            });

            expect(metadata.title).toBe('GamesPassionFR');
            expect(metadata.description).toBe(description);
            expect(metadata.alternates?.types).toEqual({
                'application/rss+xml': '/rss.xml',
                'application/feed+json': '/feed.json',
            });
        }
    });
});
