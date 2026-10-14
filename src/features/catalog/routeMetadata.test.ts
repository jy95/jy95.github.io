import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }));
const loaders = vi.hoisted(() => ({ companies: vi.fn(), series: vi.fn(), dlcs: vi.fn() }));
vi.mock('@/app/api/companies/data', () => ({ loadCompanies: loaders.companies, companyImagePath: () => '/companies/1/cover.webp', toCompanySummary: () => ({ gamesCount: 1 }) }));
vi.mock('@/app/api/series/data', () => ({ loadSeries: loaders.series, toSeriesSummary: () => ({ name: 'Series', gamesCount: 2, imagePath: '/seriescovers/1/cover.webp' }) }));
vi.mock('@/app/api/dlcs/data', () => ({ loadDlcGroups: loaders.dlcs, toDlcSummary: () => ({ name: 'Parent game', dlcsCount: 2, imagePath: '/covers/1/cover.webp' }) }));
import { generateMetadata as companyMetadata } from '@/app/[locale]/companies/[id]/layout';
import { generateMetadata as seriesMetadata } from '@/app/[locale]/games/series/[id]/layout';
import { generateMetadata as dlcMetadata } from '@/app/[locale]/games/dlcs/[id]/layout';

const routes = [
    { generate: companyMetadata, loader: loaders.companies, path: '/companies/1' },
    { generate: seriesMetadata, loader: loaders.series, path: '/games/series/1' },
    { generate: dlcMetadata, loader: loaders.dlcs, path: '/games/dlcs/1' },
];

describe('entity route metadata', () => {
    beforeEach(() => {
        loaders.companies.mockResolvedValue([{ id: 1, name: 'Company' }]);
        loaders.series.mockResolvedValue([{ id: 1 }]);
        loaders.dlcs.mockResolvedValue([{ id: '1' }]);
    });
    for (const { generate, loader, path } of routes) {
        it(`uses localized canonical paths for ${path}`, async () => {
            for (const locale of ['fr', 'en']) {
                const metadata = await generate({ params: Promise.resolve({ locale, id: '1' }) });
                expect(metadata.alternates?.canonical).toBe(`${locale === 'en' ? '/en' : ''}${path}`);
                expect(metadata.alternates?.languages).toEqual({ fr: path, en: `/en${path}` });
            }
        });
        it(`clears inherited social identity on failed ${path} lookups`, async () => {
            loader.mockRejectedValue(new Error('lookup failed'));
            const metadata = await generate({ params: Promise.resolve({ locale: 'en', id: '1' }) });
            expect(metadata.robots).toEqual({ index: false, follow: false });
            expect(metadata.openGraph).toBeNull();
            expect(metadata.alternates).toBeNull();
        });
    }
});
