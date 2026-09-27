import { generateMetadata as rootLayoutMetadata } from '@/app/[locale]/layout';
import { generateMetadata as rootPageMetadata } from '@/app/[locale]/page';
import { generateMetadata as backlogMetadata } from '@/app/[locale]/backlog/page';
import { generateMetadata as linksMetadata } from '@/app/[locale]/links/page';
import { generateMetadata as companiesMetadata } from '@/app/[locale]/companies/layout';
import { generateMetadata as companyMetadata } from '@/app/[locale]/companies/[id]/layout';
import { generateMetadata as seriesMetadata } from '@/app/[locale]/games/series/layout';
import { generateMetadata as dlcsMetadata } from '@/app/[locale]/games/dlcs/layout';
import { generateMetadata as randomMetadata } from '@/app/[locale]/games/random/layout';
import { generateMetadata as tierMetadata } from '@/app/[locale]/tier/page';
import { generateMetadata as tierGamesMetadata } from '@/app/[locale]/tier/games/layout';
import { generateMetadata as tierBacklogMetadata } from '@/app/[locale]/tier/backlog/layout';
import { generateMetadata as tierTestsMetadata } from '@/app/[locale]/tier/tests/layout';
import { generateMetadata as playlistMetadata } from '@/app/[locale]/playlist/[id]/page';
import { generateMetadata as videoMetadata } from '@/app/[locale]/video/[id]/page';
import { generateStaticParams as videoStaticParams } from '@/app/[locale]/video/[id]/page';
import { generateStaticParams as playlistStaticParams } from '@/app/[locale]/playlist/[id]/page';
import videoPage from '@/app/[locale]/video/[id]/page';
import playlistPage from '@/app/[locale]/playlist/[id]/page';
import { generateMetadata as gamesMetadata } from '@/app/[locale]/games/layout';
import { generateMetadata as planningMetadata } from '@/app/[locale]/planning/layout';
import { generateMetadata as testsMetadata } from '@/app/[locale]/tests/layout';
import { generateMetadata as statsMetadata } from '@/app/[locale]/stats/layout';
import { createStaticSectionMetadata, staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import * as mediaApi from '@/app/api/metadata/response';
import * as companyApi from '@/app/api/companies/response';
import { NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/routing', () => ({ routing: { locales: ['fr', 'en'] } }));
vi.mock('next/root-params', () => ({ locale: () => Promise.resolve('fr') }));
vi.mock('@/providers/ThemeProvider', () => ({ ThemeProvider: () => null }));
vi.mock('@/providers/StoreProvider', () => ({ default: () => null }));
vi.mock('@/components/dashboard/DashboardAppProvider', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('next-intl/server', async importOriginal => ({
    ...await importOriginal<typeof import('next-intl/server')>(),
    getTranslations: async () => () => 'Random',
}));

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

    it('limits feed alternates to the root page in both locales', async () => {
        for (const [locale, description] of [
            ['en', 'Browse the GamesPassionFR game collection.'],
            ['fr', 'Catalogue des jeux de GamesPassionFR.'],
        ] as const) {
            const layout = await rootLayoutMetadata({
                params: Promise.resolve({ locale }),
                children: null,
            });
            const metadata = await rootPageMetadata({ params: Promise.resolve({ locale }) });

            expect(metadata.title).toBe('GamesPassionFR');
            expect(metadata.description).toBe(description);
            expect(layout.alternates).toBeUndefined();
            expect(metadata.alternates?.types).toEqual({
                'application/rss+xml': '/rss.xml',
                'application/feed+json': '/feed.json',
            });
            for (const generate of [gamesMetadata, linksMetadata, companiesMetadata]) {
                const child = await generate({ params: Promise.resolve({ locale }) });
                expect(child.alternates).toBeUndefined();
            }
        }
    });
});

describe('ID route metadata', () => {
    it('resolves titles for generated media parameters without an HTTP server', async () => {
        const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No HTTP server is available'));
        try {
            for (const { generate, staticParams, id } of [
                { generate: videoMetadata, staticParams: videoStaticParams, id: 'FO8cYct2Bkw' },
                { generate: playlistMetadata, staticParams: playlistStaticParams, id: 'PLRfhDHeBTBJ7MU5DX4P_oBIRN457ah9lA' },
            ]) {
                expect(await staticParams()).toContainEqual({ id });
                expect((await generate({ params: Promise.resolve({ id, locale: 'en' }) })).title).toBeTruthy();
            }
            expect(fetch).not.toHaveBeenCalled();
        } finally {
            fetch.mockRestore();
        }
    });

    const cases = [
        { generate: videoMetadata, id: 'RMgDUMubFsM', title: 'Nova Drift', imagePath: '/testscovers/RMgDUMubFsM/cover.webp' },
        { generate: videoMetadata, id: 'IwBRxURrIDM', title: 'Portal', imagePath: '/covers/IwBRxURrIDM/cover.webp' },
        // Past planning takes priority over the DLC entry for this shared video ID.
        { generate: videoMetadata, id: 'FO8cYct2Bkw', title: 'Batman: Arkham Knight - Red Hood Story Pack', imagePath: '/covers/FO8cYct2Bkw/cover.webp' },
        { generate: playlistMetadata, id: 'PLRfhDHeBTBJ7MU5DX4P_oBIRN457ah9lA', title: '-KLAUS-', imagePath: '/covers/PLRfhDHeBTBJ7MU5DX4P_oBIRN457ah9lA/cover.webp' },
        { generate: playlistMetadata, id: 'PLRfhDHeBTBJ61m6JTpZhGNrrJqw06TcvP', title: 'Ratatouille', imagePath: '/covers/PLRfhDHeBTBJ61m6JTpZhGNrrJqw06TcvP/cover.webp' },
        { generate: playlistMetadata, id: 'PLRfhDHeBTBJ7kgZQ8pv1-OByUypdJLr8M', title: 'Creepy Road', imagePath: '/testscovers/PLRfhDHeBTBJ7kgZQ8pv1-OByUypdJLr8M/cover.webp' },
    ];

    for (const { generate, id, title, imagePath } of cases) {
        it(`uses the entry title for ${id} in both locales`, async () => {
            for (const locale of ['en', 'fr']) {
                const metadata = await generate({ params: Promise.resolve({ id, locale: locale as 'en' | 'fr' }) });
                expect(metadata.title).toBe(`${title} | GamesPassionFR`);
                expect(metadata.openGraph?.images).toEqual([imagePath]);
                expect(metadata.alternates).toBeUndefined();
                expect(metadata.description).toBe(generate === videoMetadata
                    ? (locale === 'en' ? 'Watch a GamesPassionFR game video.' : 'Regardez une vidéo de jeu de GamesPassionFR.')
                    : (locale === 'en' ? 'Watch a GamesPassionFR game playlist.' : 'Regardez une playlist de jeu de GamesPassionFR.'));
            }
        });
    }

    it('uses the company name in both locales', async () => {
        for (const locale of ['en', 'fr']) {
            const metadata = await companyMetadata({ params: Promise.resolve({ id: '83', locale }) });
            expect(metadata.title).toBe('Sony Computer Entertainment | GamesPassionFR');
            expect(metadata.openGraph?.images).toEqual(['/companies/83/cover.webp']);
            expect(metadata.alternates).toBeUndefined();
            expect(metadata.description).toBe(locale === 'en'
                ? 'Explore games by this developer or publisher in the GamesPassionFR collection.'
                : 'Découvrez les jeux de ce développeur ou éditeur dans le catalogue GamesPassionFR.');
        }
    });

    for (const [route, generate] of [
        ['video', videoMetadata],
        ['playlist', playlistMetadata],
        ['company', companyMetadata],
    ] as const) {
        it(`returns not found for an unknown ${route} ID in both locales`, async () => {
            for (const locale of ['en', 'fr']) {
                await expect(generate({ params: Promise.resolve({ id: 'missing-id', locale: locale as 'en' | 'fr' }) }))
                    .rejects.toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' });
            }
        });
    }

    it('does not repeat the metadata lookup when rendering media pages', async () => {
        const lookup = vi.spyOn(mediaApi, 'getMediaResponse');
        for (const page of [videoPage, playlistPage]) {
            await expect(page({ params: Promise.resolve({ id: 'missing-id', locale: 'en' }) }))
                .resolves.toBeTruthy();
        }
        expect(lookup).not.toHaveBeenCalled();
        lookup.mockRestore();
    });

    it('reports API failures from both media routes and the company route', async () => {
        const mediaFailure = vi.spyOn(mediaApi, 'getMediaResponse').mockResolvedValue(NextResponse.json({ error: 'Unavailable' }, { status: 503 }));
        const companyFailure = vi.spyOn(companyApi, 'getCompanyResponse').mockResolvedValue(NextResponse.json({ error: 'Unavailable' }, { status: 503 }));
        try {
            for (const generate of [videoMetadata, playlistMetadata, companyMetadata]) {
                await expect(generate({ params: Promise.resolve({ id: 'any-id', locale: 'en' }) }))
                    .rejects.toThrow('Title lookup failed with status 503');
            }
        } finally {
            mediaFailure.mockRestore();
            companyFailure.mockRestore();
        }
    });
});

describe('route-specific metadata fields', () => {
    it('keeps route-specific alternates and other fields', async () => {
        const generate = createStaticSectionMetadata('links', {
            robots: { index: false },
            alternates: { canonical: '/en/links', types: { 'text/plain': '/links.txt' } },
        });
        const metadata = await generate({ params: Promise.resolve({ locale: 'en' }) });

        expect(metadata.title).toBe('Links | GamesPassionFR');
        expect(metadata.description).toBe('Find links related to the GamesPassionFR YouTube channel.');
        expect(metadata.robots).toEqual({ index: false });
        expect(metadata.alternates).toEqual({
            canonical: '/en/links',
            types: {
                'text/plain': '/links.txt',
            },
        });
    });

    it('allows route-specific titles without replacing the localized description', () => {
        expect(staticSectionMetadata('fr', 'video', { title: 'Nova Drift | GamesPassionFR' }))
            .toMatchObject({
                title: 'Nova Drift | GamesPassionFR',
                description: 'Regardez une vidéo de jeu de GamesPassionFR.',
            });
    });
});
