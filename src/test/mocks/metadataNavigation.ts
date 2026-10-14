/** Mirrors the configured prefixes and interpolates IDs for metadata unit tests. */
export function createNavigation(config: { defaultLocale: string; localePrefix: string; pathnames: Record<string, string> }) {
    return {
        getPathname: ({ locale, href }: { locale: string; href: string | { pathname: string; params: Record<string, string> } }) => {
            const template = typeof href === 'string' ? href : href.pathname;
            let pathname = config.pathnames[template] ?? template;
            if (typeof href !== 'string') {
                for (const [key, value] of Object.entries(href.params)) pathname = pathname.replace(`[${key}]`, encodeURIComponent(value));
            }
            return `${config.localePrefix === 'always' || locale !== config.defaultLocale ? `/${locale}` : ''}${pathname}`;
        },
    };
}
