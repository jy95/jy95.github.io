import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTranslator } from 'next-intl';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

const data = vi.hoisted(() => ({
    companies: vi.fn(), series: vi.fn(), dlcs: vi.fn(),
    published: vi.fn(), planning: vi.fn(), backlog: vi.fn(), resolve: vi.fn(),
}));
vi.mock('@/i18n/routing', () => ({
    routing: { locales: ['fr', 'en'], defaultLocale: 'fr' },
    getPathname: ({ locale, href }: { locale: string; href: { pathname: string; params: { id: string } } }) =>
        `${locale === 'en' ? '/en' : ''}${href.pathname.replace('[id]', href.params.id)}`,
}));
vi.mock('next-intl/server', () => ({
    getTranslations: async ({ locale, namespace }: { locale: 'fr' | 'en'; namespace: 'detailMetadata' | 'detailMetadata.game' }) =>
        createTranslator({ locale, messages: locale === 'en' ? en : fr, namespace }),
}));
vi.mock('@/app/api/companies/data', async importOriginal => ({
    ...await importOriginal<typeof import('@/app/api/companies/data')>(), loadCompanies: data.companies,
}));
vi.mock('@/app/api/series/data', async importOriginal => ({
    ...await importOriginal<typeof import('@/app/api/series/data')>(), loadSeries: data.series,
}));
vi.mock('@/lib/gamesData', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/gamesData')>(),
    loadDlcGroups: data.dlcs, loadPublishedGames: data.published,
    loadPlanningGames: data.planning, loadBacklogGames: data.backlog,
}));
vi.mock('@/lib/gameDetails', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/gameDetails')>(), resolveGameDetails: data.resolve,
}));
vi.mock('./companies/[id]/PageClient', () => ({ default: vi.fn(() => null) }));
vi.mock('./games/series/[id]/PageClient', () => ({ default: vi.fn(() => null) }));
vi.mock('./games/dlcs/[id]/PageClient', () => ({ default: vi.fn(() => null) }));
vi.mock('./games/detail/[id]/PageClient', () => ({ default: vi.fn(() => null) }));

import * as company from './companies/[id]/page';
import * as series from './games/series/[id]/page';
import * as dlc from './games/dlcs/[id]/page';
import * as game from './games/detail/[id]/page';
import CompanyClient from './companies/[id]/PageClient';
import SeriesClient from './games/series/[id]/PageClient';
import DlcClient from './games/dlcs/[id]/PageClient';
import GameClient from './games/detail/[id]/PageClient';

beforeEach(() => {
    vi.clearAllMocks();
    data.companies.mockResolvedValue([{ id: 1, name: 'Example', developerItems: [{ id: 2 }], publisherItems: [{ id: 2 }] }, { id: 2, name: 'Another company', developerItems: [], publisherItems: [] }]);
    data.series.mockResolvedValue([{ id: 1, name: 'Example', items: [{}] }, { id: 2, name: 'Another series', items: [] }]);
    data.dlcs.mockResolvedValue([{ id: '1', game_title: 'Example', dlcs: [{ playlistId: 'DLC' }] }, { id: '2', game_title: 'Another game', dlcs: [] }]);
    data.published.mockResolvedValue([{ playlistId: 'Published' }, { videoId: 'Video' }]);
    data.planning.mockResolvedValue([{ playlistId: 'Planned' }, { videoId: 'PlannedVideo' }]);
    data.backlog.mockResolvedValue([{ id: 12 }, { id: 13 }]);
    data.resolve.mockResolvedValue({ source: 'published', game: { title: 'Example', imagePath: '/covers/1/cover.webp' } });
});

const entities = [
    { entity: 'company', route: company, path: '/companies/1', image: '/companies/1/cover.webp', english: 'Example: 1 game developed or published in the GamesPassionFR catalog.' },
    { entity: 'series', route: series, path: '/games/series/1', image: '/seriescovers/1/cover.webp', english: 'Example: 1 game from this video game series in the GamesPassionFR catalog.' },
    { entity: 'dlc', route: dlc, path: '/games/dlcs/1', image: '/covers/1/cover.webp', english: 'Example: 1 DLC in the GamesPassionFR catalog.' },
] as const;

describe('catalog server route exports', () => {
    it.each(entities)('enumerates string IDs in source order for $path without repeating parent locales', async ({ route }) => {
        expect(await route.generateStaticParams()).toEqual([{ id: '1' }, { id: '2' }]);
    });
    for (const { entity, route, path, image, english } of entities) {
        it.each(['fr', 'en', 'de'])(`integrates lookup, summary and metadata for ${path} (%s)`, async locale => {
            const metadata = await route.generateMetadata({ params: Promise.resolve({ locale, id: '1' }) });
            expect(metadata.title).toBe('Example | GamesPassionFR');
            if (locale === 'en') expect(metadata.description).toBe(english);
            else {
                const t = createTranslator({ locale: 'fr', messages: fr, namespace: 'detailMetadata' });
                expect(metadata.description).toBe(t(entity, { name: 'Example', count: 1 }));
                expect(metadata).toEqual(await route.generateMetadata({ params: Promise.resolve({ locale: 'fr', id: '1' }) }));
            }
            expect(metadata.openGraph?.images).toEqual([{ url: image, alt: 'Example' }]);
            expect(metadata.alternates).toEqual({
                canonical: locale === 'en' ? `/en${path}` : path,
                languages: { fr: path, en: `/en${path}` },
                types: { 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' },
            });
        });
        it(`uses the matching record's zero count and image for ${path}`, async () => {
            const metadata = await route.generateMetadata({ params: Promise.resolve({ locale: 'en', id: '2' }) });
            const name = entity === 'company' ? 'Another company' : entity === 'series' ? 'Another series' : 'Another game';
            const t = createTranslator({ locale: 'en', messages: en, namespace: 'detailMetadata' });
            expect(metadata.title).toBe(`${name} | GamesPassionFR`);
            expect(metadata.description).toBe(t(entity, { name, count: 0 }));
            expect(metadata.openGraph?.images).toEqual([{ url: image.replace('/1/', '/2/'), alt: name }]);
            expect(metadata.alternates?.canonical).toBe(`/en${path.replace('/1', '/2')}`);
        });
        it(`uses the summary's multiple-item count for ${path}`, async () => {
            if (entity === 'company') data.companies.mockResolvedValue([
                { id: 1, name: 'Example', developerItems: [{ id: 2 }, { id: 3 }], publisherItems: [{ id: 2 }, { id: 4 }] },
            ]);
            else if (entity === 'series') data.series.mockResolvedValue([{ id: 1, name: 'Example', items: [{}, {}, {}] }]);
            else data.dlcs.mockResolvedValue([{ id: '1', game_title: 'Example', dlcs: [{}, {}, {}] }]);
            const metadata = await route.generateMetadata({ params: Promise.resolve({ locale: 'en', id: '1' }) });
            const t = createTranslator({ locale: 'en', messages: en, namespace: 'detailMetadata' });
            expect(metadata.description).toBe(t(entity, { name: 'Example', count: 3 }));
        });
        it(`noindexes missing records for ${path}`, async () => {
            expect(await route.generateMetadata({ params: Promise.resolve({ locale: 'en', id: 'missing' }) }))
                .toEqual({ robots: { index: false, follow: false } });
        });
    }
    it('encodes catalog identifiers without changing record lookup', async () => {
        data.dlcs.mockResolvedValue([{ id: 'a/b?#', game_title: 'Example', dlcs: [] }]);
        const metadata = await dlc.generateMetadata({ params: Promise.resolve({ locale: 'en', id: 'a/b?#' }) });
        expect(metadata.alternates?.canonical).toBe('/en/games/dlcs/a%2Fb%3F%23');
        expect(metadata.openGraph).toMatchObject({ url: metadata.alternates?.canonical, locale: 'en', alternateLocale: ['fr'] });
    });
    it('exports the client components directly, preserving promised parameters', () => {
        const params = Promise.resolve({ locale: 'en', id: '1' });
        for (const [page, client] of [[company.default, CompanyClient], [series.default, SeriesClient], [dlc.default, DlcClient], [game.default, GameClient]]) {
            expect(page).toBe(client);
            page({ params });
            expect(client).toHaveBeenCalledWith({ params });
        }
    });
    it('enumerates every runtime game source in source order', async () => {
        expect(await game.generateStaticParams()).toEqual([
            { id: 'Published' }, { id: 'Video' }, { id: 'DLC' }, { id: 'Planned' }, { id: 'PlannedVideo' }, { id: '12' }, { id: '13' },
        ]);
    });
    it('uses playlist identity when a source record also contains a video identifier', async () => {
        data.published.mockResolvedValue([{ playlistId: 'Published', videoId: 'PublishedVideo' }]);
        data.dlcs.mockResolvedValue([{ id: 'parent', dlcs: [{ playlistId: 'DLC', videoId: 'DlcVideo' }] }]);
        data.planning.mockResolvedValue([{ playlistId: 'Planned', videoId: 'PlannedVideo' }]);
        expect(await game.generateStaticParams()).toEqual([
            { id: 'Published' }, { id: 'DLC' }, { id: 'Planned' }, { id: '12' }, { id: '13' },
        ]);
    });
    it.each(['fr', 'en', 'de'])('preserves forced locale prefixes for game metadata (%s)', async locale => {
        const metadata = await game.generateMetadata({ params: Promise.resolve({ locale, id: 'a/b' }) });
        expect(data.resolve).toHaveBeenCalledWith('a/b');
        expect(metadata.alternates?.canonical).toBe(`/${locale === 'en' ? 'en' : 'fr'}/games/detail/a%2Fb`);
        expect(metadata.alternates?.languages).toEqual({ fr: '/fr/games/detail/a%2Fb', en: '/en/games/detail/a%2Fb' });
        expect(metadata.openGraph?.images).toEqual([{ url: '/covers/1/cover.webp', alt: 'Example' }]);
    });
    it.each(['missing', 'failure'])('noindexes game lookup %s without throwing not-found', async mode => {
        if (mode === 'failure') data.resolve.mockRejectedValue(new Error('lookup failed'));
        else data.resolve.mockResolvedValue(undefined);
        expect(await game.generateMetadata({ params: Promise.resolve({ locale: 'en', id: '1' }) }))
            .toEqual({ robots: { index: false, follow: false } });
    });
    it('propagates static-generation loader failures rather than silently dropping IDs', async () => {
        data.backlog.mockRejectedValue(new Error('catalog unavailable'));
        await expect(game.generateStaticParams()).rejects.toThrow('catalog unavailable');
    });
    it('returns no game parameters when all sources are empty', async () => {
        for (const loader of [data.published, data.dlcs, data.planning, data.backlog]) loader.mockResolvedValue([]);
        expect(await game.generateStaticParams()).toEqual([]);
    });
    it.each(entities)('handles empty entity sources for $path', async ({ entity, route }) => {
        const loader = entity === 'company' ? data.companies : entity === 'series' ? data.series : data.dlcs;
        loader.mockResolvedValue([]);
        expect(await route.generateStaticParams()).toEqual([]);
        expect(await route.generateMetadata({ params: Promise.resolve({ locale: 'en', id: '1' }) }))
            .toEqual({ robots: { index: false, follow: false } });
        loader.mockRejectedValue(new Error('entity unavailable'));
        await expect(route.generateStaticParams()).rejects.toThrow('entity unavailable');
        await expect(route.generateMetadata({ params: Promise.resolve({ locale: 'en', id: '1' }) }))
            .rejects.toThrow('entity unavailable');
    });
    it.each(['published', 'dlcs', 'planning', 'backlog'] as const)('propagates %s loader failures', async source => {
        data[source].mockRejectedValue(new Error('source unavailable'));
        await expect(game.generateStaticParams()).rejects.toThrow('source unavailable');
    });
});
