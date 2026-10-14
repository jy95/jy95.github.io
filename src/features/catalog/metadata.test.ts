import { describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
vi.mock('next-intl/server', () => ({
    getTranslations: async () => (key: string, values: { name: string; count: number }) => `${key}: ${values.name} (${values.count})`,
}));
import { entityDetailMetadata } from './metadata';

describe('entity metadata', () => {
    it.each(['company', 'series', 'dlc'] as const)('preserves %s content and adds complete social fields', async entity => {
        const metadata = await entityDetailMetadata({ locale: 'fr', entity, found: { name: 'Étoile', count: 2 }, pathnameFor: l => `/${l}/entity/1` });
        expect(metadata.description).toBe(`${entity}: Étoile (2)`);
        expect(metadata.openGraph).toMatchObject({ locale: 'fr_FR', url: expect.stringContaining('/fr/entity/1') });
        expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Étoile' });
        expect(metadata.alternates?.languages).toEqual({ fr: '/fr/entity/1', en: '/en/entity/1' });
    });
    it('noindexes missing entities', async () => {
        expect((await entityDetailMetadata({ locale: 'en', entity: 'company', found: undefined, pathnameFor: () => '/companies/0' })).robots).toEqual({ index: false, follow: false });
    });
});
