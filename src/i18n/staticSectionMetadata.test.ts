import { describe, expect, it } from 'vitest';
import { generateMetadata as gamesMetadata } from '@/app/[locale]/games/layout';
import { generateMetadata as planningMetadata } from '@/app/[locale]/planning/layout';
import { generateMetadata as testsMetadata } from '@/app/[locale]/tests/layout';
import { generateMetadata as statsMetadata } from '@/app/[locale]/stats/layout';

const sections = [
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
