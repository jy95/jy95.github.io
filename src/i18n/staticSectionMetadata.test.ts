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
import { describe, expect, it } from 'vitest';
import { generateMetadata as gamesMetadata } from '@/app/[locale]/games/layout';
import { generateMetadata as planningMetadata } from '@/app/[locale]/planning/layout';
import { generateMetadata as testsMetadata } from '@/app/[locale]/tests/layout';
import { generateMetadata as statsMetadata } from '@/app/[locale]/stats/layout';

const sections = [
    { generate: backlogMetadata, en: "Backlog", fr: "Backlog" },
    { generate: linksMetadata, en: "Links", fr: "Liens" },
    { generate: companiesMetadata, en: "Companies", fr: "Entreprises" },
    { generate: companyMetadata, en: "Company Games", fr: "Jeux de l’entreprise" },
    { generate: seriesMetadata, en: "Game Series", fr: "Séries de jeux" },
    { generate: dlcsMetadata, en: "DLCs", fr: "Contenus additionnels" },
    { generate: randomMetadata, en: "Random Game", fr: "Jeu aléatoire" },
    { generate: tierMetadata, en: "Tier Lists", fr: "Tier lists" },
    { generate: tierGamesMetadata, en: "Completed Games Tier List", fr: "Classement des jeux terminés" },
    { generate: tierBacklogMetadata, en: "Backlog Tier List", fr: "Classement du backlog" },
    { generate: tierTestsMetadata, en: "Game Reviews Tier List", fr: "Classement des tests de jeux" },
    { generate: playlistMetadata, en: "Game Playlist", fr: "Playlist de jeu" },
    { generate: videoMetadata, en: "Game Video", fr: "Vidéo de jeu" },

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
        });
    }

    it('uses French metadata for an unsupported locale', async () => {
        const unknown = await gamesMetadata({ params: Promise.resolve({ locale: 'de' }) });
        const french = await gamesMetadata({ params: Promise.resolve({ locale: 'fr' }) });

        expect(unknown).toEqual(french);
    });
});
