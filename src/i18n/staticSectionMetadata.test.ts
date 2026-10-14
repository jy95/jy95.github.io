import { describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
import { generateMetadata as gamesMetadata } from '@/app/[locale]/games/layout';
import { generateMetadata as planningMetadata } from '@/app/[locale]/planning/layout';
import { generateMetadata as testsMetadata } from '@/app/[locale]/tests/layout';
import { generateMetadata as statsMetadata } from '@/app/[locale]/stats/layout';
import { generateMetadata as seriesMetadata } from '@/app/[locale]/games/series/layout';

import { generateMetadata as dlcsMetadata } from '@/app/[locale]/games/dlcs/layout';

import { generateMetadata as backlogMetadata } from '@/app/[locale]/backlog/layout';
import { generateMetadata as companiesMetadata } from '@/app/[locale]/companies/layout';
import { generateMetadata as linksMetadata } from '@/app/[locale]/links/layout';
import { generateMetadata as tierMetadata } from '@/app/[locale]/tier/layout';
import { generateMetadata as tierGamesMetadata } from '@/app/[locale]/tier/games/layout';
import { generateMetadata as tierBacklogMetadata } from '@/app/[locale]/tier/backlog/layout';
import { generateMetadata as tierTestsMetadata } from '@/app/[locale]/tier/tests/layout';

const sections = [
    { generate: backlogMetadata, en: 'Backlog', fr: 'En attente' },
    { generate: companiesMetadata, en: 'Companies', fr: 'Entreprises' },
    { generate: linksMetadata, en: 'Links', fr: 'Liens' },
    { generate: tierMetadata, en: 'Tier lists', fr: 'Classements' },
    { generate: tierGamesMetadata, en: 'Published Games Tier List', fr: 'Classement des jeux publiés' },
    { generate: tierBacklogMetadata, en: 'Backlog Tier List', fr: 'Classement des jeux en attente' },
    { generate: tierTestsMetadata, en: 'Game Tests Tier List', fr: 'Classement des tests' },
    { generate: dlcsMetadata, en: 'DLCs', fr: 'DLCs' },
    { generate: seriesMetadata, en: 'Series', fr: 'Séries' },
    { generate: gamesMetadata, en: 'Games', fr: 'Jeux' },
    { generate: planningMetadata, en: 'Calendar', fr: 'Planning' },
    { generate: testsMetadata, en: 'Game Reviews', fr: 'Tests de jeux' },
    { generate: statsMetadata, en: 'Statistics', fr: 'Statistiques' },
];

describe('static section metadata', () => {
    for (const { generate, en, fr } of sections) {
        it(`uses localized metadata for ${en}`, async () => {
            const english = await generate({ params: Promise.resolve({ locale: 'en' }) });
            const french = await generate({ params: Promise.resolve({ locale: 'fr' }) });

            expect(english.title).toBe(`${en} | GamesPassionFR`);
            expect(french.title).toBe(`${fr} | GamesPassionFR`);
            expect(english.description).toBeTruthy();
            expect(french.description).toBeTruthy();
            expect(english.description).not.toBe(french.description);
            expect(english.openGraph).toMatchObject({ locale: 'en_US', alternateLocale: ['fr_FR'], siteName: 'GamesPassionFR' });
            expect(french.openGraph).toMatchObject({ locale: 'fr_FR', alternateLocale: ['en_US'] });
            expect(english.twitter).toMatchObject({ card: 'summary_large_image', description: english.description });
            expect(english.alternates?.canonical).toMatch(/^\/en\//);
            expect(french.alternates?.canonical).not.toMatch(/^\/fr\//);
            expect(english.alternates?.types).toHaveProperty('application/rss+xml', '/rss.xml');
        });
    }

    it('uses French metadata for an unsupported locale', async () => {
        const unknown = await gamesMetadata({ params: Promise.resolve({ locale: 'de' }) });
        const french = await gamesMetadata({ params: Promise.resolve({ locale: 'fr' }) });

        expect(unknown).toEqual(french);
    });
});
