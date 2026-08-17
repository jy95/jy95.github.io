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
    const module = await import('./sitemap');
    return module.default;
}

describe('sitemap', () => {
    it('includes static routes and excludes the root redirect route', async () => {
        const sitemap = await loadSitemap();

        const entries = sitemap();

        expect(entries).toHaveLength(2);
        expect(entries.map((entry) => entry.url)).toEqual([
            'https://jy95.github.io/en/games',
            'https://jy95.github.io/en/backlog',
        ]);
    });

    it('excludes dynamic routes', async () => {
        const sitemap = await loadSitemap();

        const entries = sitemap();

        expect(entries.map((entry) => entry.url)).not.toContain('https://jy95.github.io/en/video/[id]');
        expect(entries.map((entry) => entry.url)).not.toContain('https://jy95.github.io/en/playlist/[id]');
    });

    it('generates an alternate URL for every configured locale', async () => {
        const sitemap = await loadSitemap();

        const entries = sitemap();
        const gamesEntry = entries.find((entry) => entry.url === 'https://jy95.github.io/en/games');

        expect(gamesEntry).toMatchObject({
            alternates: {
                languages: {
                    en: 'https://jy95.github.io/en/games',
                    fr: 'https://jy95.github.io/fr/games',
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

    it('uses VERCEL_URL when VERCEL_PROJECT_PRODUCTION_URL is unavailable', async () => {
        vi.stubEnv('VERCEL_URL', 'preview.example.com');

        const sitemap = await loadSitemap();

        expect(sitemap()[0].url).toBe('https://preview.example.com/en/games');
    });
});
