import { afterEach, describe, expect, it, vi } from 'vitest';

const getPathnameMock = vi.fn(
    ({ locale, href }: { locale: string; href: string }) => `/${locale}${href === '/' ? '' : href}`
);

vi.mock('@/i18n/routing', () => ({
    routing: {
        pathnames: {
            '/': '/',
            '/games': '/games',
            '/backlog': '/backlog',
            '/video/[id]': '/video/[id]',
            '/playlist/[id]': '/playlist/[id]',
        },
        locales: ['en', 'fr'],
        defaultLocale: 'en',
    },
    getPathname: getPathnameMock,
}));

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    getPathnameMock.mockClear();
});

async function loadSitemap() {
    const sitemapModule = await import('./sitemap');
    return sitemapModule.default;
}

describe('sitemap', () => {
    it('includes static routes and excludes the root redirect route', async () => {
        const sitemap = await loadSitemap();

        const entries = sitemap();

        expect(entries).toHaveLength(2);
        expect(entries.map((entry) => entry.url)).toEqual([
            'https://gpfr-git-master-jy95s-projects.vercel.app/en/games',
            'https://gpfr-git-master-jy95s-projects.vercel.app/en/backlog',
        ]);
    });

    it('excludes dynamic routes', async () => {
        const sitemap = await loadSitemap();

        const entries = sitemap();

        expect(entries.map((entry) => entry.url)).not.toContain('https://gpfr-git-master-jy95s-projects.vercel.app/en/video/[id]');
        expect(entries.map((entry) => entry.url)).not.toContain('https://gpfr-git-master-jy95s-projects.vercel.app/en/playlist/[id]');
    });

    it('generates an alternate URL for every configured locale', async () => {
        const sitemap = await loadSitemap();

        const entries = sitemap();
        const gamesEntry = entries.find((entry) => entry.url === 'https://gpfr-git-master-jy95s-projects.vercel.app/en/games');

        expect(gamesEntry).toMatchObject({
            alternates: {
                languages: {
                    en: 'https://gpfr-git-master-jy95s-projects.vercel.app/en/games',
                    fr: 'https://gpfr-git-master-jy95s-projects.vercel.app/fr/games',
                },
            },
        });
    });

    it('adds daily change frequency and a generated last-modified date', async () => {
        const sitemap = await loadSitemap();

        for (const entry of sitemap()) {
            expect(entry.changeFrequency).toBe('daily');
            expect(entry.lastModified).toBeInstanceOf(Date);
        }
    });

    it('uses VERCEL_PROJECT_PRODUCTION_URL before VERCEL_URL', async () => {
        vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'production.example.com');
        vi.stubEnv('VERCEL_URL', 'preview.example.com');

        const sitemap = await loadSitemap();

        expect(sitemap()[0].url).toBe('https://production.example.com/en/games');
    });

    it('ignores preview URLs when the production domain is unavailable', async () => {
        vi.stubEnv('VERCEL_URL', 'preview.example.com');

        const sitemap = await loadSitemap();

        expect(sitemap()[0].url).toBe('https://gpfr-git-master-jy95s-projects.vercel.app/en/games');
    });
});
