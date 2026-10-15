import { describe, expect, it, vi } from 'vitest';
import { createTranslator } from 'next-intl';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

vi.mock('@/i18n/routing', () => ({
    routing: { locales: ['fr', 'en'], defaultLocale: 'fr' },
    getPathname: ({ locale, href }: { locale: string; href: string }) => `${locale === 'en' ? '/en' : ''}${href}`,
}));
vi.mock('next-intl/server', () => ({
    getTranslations: async (options: 'backlog' | { locale: 'fr' | 'en' }) => {
        const locale = typeof options === 'string' ? 'en' : options.locale;
        const namespace = typeof options === 'string' ? options : 'siteMetadata';
        return createTranslator({ locale, messages: locale === 'en' ? en : fr, namespace });
    },
}));
vi.mock('next/root-params', () => ({ locale: async () => 'fr' }));
vi.mock('@/providers/ThemeProvider', () => ({ ThemeProvider: vi.fn() }));
vi.mock('@/providers/StoreProvider', () => ({ default: vi.fn() }));
vi.mock('@/components/dashboard/DashboardAppProvider', () => ({ default: vi.fn() }));
vi.mock('@/components/Footer', () => ({ default: vi.fn() }));
vi.mock('@/components/backlog/BacklogViewerClient', () => ({ default: vi.fn() }));
vi.mock('@/i18n/localizedRedirect', () => ({ redirectToLocalizedPath: vi.fn() }));
vi.mock('./companies/PageClient', () => ({ default: vi.fn() }));
vi.mock('./games/PageClient', () => ({ default: vi.fn() }));
vi.mock('./games/dlcs/PageClient', () => ({ default: vi.fn() }));
vi.mock('./games/series/PageClient', () => ({ default: vi.fn() }));
vi.mock('./games/random/PageClient', () => ({ default: vi.fn() }));
vi.mock('./planning/PageClient', () => ({ default: vi.fn() }));
vi.mock('./stats/PageClient', () => ({ default: vi.fn() }));
vi.mock('./tests/PageClient', () => ({ default: vi.fn() }));
vi.mock('./tier/backlog/PageClient', () => ({ default: vi.fn() }));
vi.mock('./tier/games/PageClient', () => ({ default: vi.fn() }));
vi.mock('./tier/tests/PageClient', () => ({ default: vi.fn() }));
vi.mock('@/features/selection/components/SelectionPageLoader', () => ({ default: vi.fn() }));

import { generateStaticParams, generateMetadata } from './layout';
import { getSiteUrl } from '@/lib/siteUrl';

const routes = [
    ['backlog', () => import('./backlog/page')],
    ['companies', () => import('./companies/page')],
    ['games', () => import('./games/page')],
    ['dlcs', () => import('./games/dlcs/page')],
    ['series', () => import('./games/series/page')],
    ['planning', () => import('./planning/page')],
    ['stats', () => import('./stats/page')],
    ['tests', () => import('./tests/page')],
    ['links', () => import('./links/page')],
    ['tier', () => import('./tier/page')],
    ['tierBacklog', () => import('./tier/backlog/page')],
    ['tierGames', () => import('./tier/games/page')],
    ['tierTests', () => import('./tier/tests/page')],
    ['selection', () => import('./selection/page')],
] as const;

describe('static server metadata integration', () => {
    it('generates supported parent locales once', () => {
        expect(generateStaticParams()).toEqual([{ locale: 'fr' }, { locale: 'en' }]);
    });
    it.each(['fr', 'en', 'de'])('localizes the root metadata and keeps feeds (%s)', async locale => {
        const messages = locale === 'en' ? en : fr;
        expect(await generateMetadata({ params: Promise.resolve({ locale }) })).toMatchObject({
            ...messages.siteMetadata, title: { default: messages.siteMetadata.title, template: '%s | GamesPassionFR' }, metadataBase: new URL(getSiteUrl()),
            alternates: { types: { 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' } },
        });
    });
    for (const [section, load] of routes) {
        it.each(['fr', 'en', 'de'])(`exports localized metadata from the ${section} page (%s)`, async locale => {
            const page = await load();
            const metadata = await page.generateMetadata({ params: Promise.resolve({ locale }) });
            const messages = locale === 'en' ? en : fr;
            expect(metadata.title).toEqual(section === 'selection'
                ? { absolute: messages.pageMetadata.selection.title } : messages.pageMetadata[section].title);
            expect(metadata.description).toBe(messages.pageMetadata[section].description);
            expect(metadata.openGraph).toBeUndefined();
            expect(metadata.twitter).toBeUndefined();
            if (section !== 'tier') {
                const rendered = await page.default({ params: Promise.resolve({ locale }) });
                if (!rendered) throw new Error('Expected section content');
                const social = rendered.props.children[0].props.metadata.openGraph;
                expect(social).toMatchObject({
                    title: section === 'selection' ? messages.pageMetadata.selection.title
                        : `${messages.pageMetadata[section].title} | GamesPassionFR`,
                    description: messages.pageMetadata[section].description,
                    locale: locale === 'en' ? 'en_US' : 'fr_FR',
                });
            }
            expect(page).not.toHaveProperty('generateStaticParams');
        });
    }
    it('gives the random page its own canonical URL', async () => {
        const page = await import('./games/random/page');
        expect(await page.generateMetadata({ params: Promise.resolve({ locale: 'en' }) }))
            .toMatchObject({ title: 'Random game', robots: { index: false, follow: true },
                alternates: { canonical: '/en/games/random' } });
    });
    it('renders the server wrappers with their corresponding client components', async () => {
        for (const load of [() => import('./companies/page'), () => import('./games/page'),
            () => import('./games/dlcs/page'), () => import('./games/series/page'),
            () => import('./games/random/page'), () => import('./planning/page'),
            () => import('./stats/page'), () => import('./tests/page'),
            () => import('./tier/backlog/page'), () => import('./tier/games/page'), () => import('./tier/tests/page')]) {
            const page = await load();
            const rendered = await page.default({ params: Promise.resolve({ locale: 'en' }) });
            expect(rendered.props.children[1].type).toBeTypeOf('function');
        }
    });
    it('renders the backlog with translated column labels', async () => {
        const { default: BacklogViewer } = await import('./backlog/page');
        const { default: BacklogClient } = await import('@/components/backlog/BacklogViewerClient');
        const wrapper = await BacklogViewer({ params: Promise.resolve({ locale: 'en' }) });
        const page = wrapper.props.children[1];
        expect(page.props.children.type).toBe(BacklogClient);
        expect(page.props.children.props).toEqual({
            titleLabel: en.backlog.columns.title,
            platformLabel: en.backlog.columns.platform,
            notesLabel: en.backlog.columns.notes,
            hltbLabel: en.backlog.columns.hltb_main,
            votesLabel: en.backlog.columns.votes,
        });
    });
    it('renders selection inside its suspense boundary', async () => {
        const { default: Selection } = await import('./selection/page');
        const { default: SelectionLoader } = await import('@/features/selection/components/SelectionPageLoader');
        const wrapper = await Selection({ params: Promise.resolve({ locale: 'en' }) });
        expect(wrapper.props.children[1].props.children.type).toBe(SelectionLoader);
    });
    it('redirects the tier index through the localized helper', async () => {
        const { default: Tier } = await import('./tier/page');
        const { redirectToLocalizedPath } = await import('@/i18n/localizedRedirect');
        await Tier();
        expect(redirectToLocalizedPath).toHaveBeenCalledWith('/tier/games');
    });
});
