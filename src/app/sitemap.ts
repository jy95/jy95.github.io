import {MetadataRoute} from 'next';
import {routing, getPathname} from '@/i18n/routing';

type Href = Parameters<typeof getPathname>[0]['href'];
type pathnames = typeof routing.pathnames;
type AvailableRoutes = keyof pathnames;
type StaticRoute = Exclude<AvailableRoutes, `${string}[${string}]`>;

// Adapt this as necessary
const host = 'https://jy95.github.io';

function isStaticPath(path: AvailableRoutes): path is Exclude<AvailableRoutes, `${string}[${string}]`> {
  return !/\[.+\]/.test(path);
}

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = Object.keys(routing.pathnames) as AvailableRoutes[];
    const staticPaths: StaticRoute[] = paths.filter(isStaticPath);
    return staticPaths.map(getEntry);
}

function getEntry(href: Href): MetadataRoute.Sitemap[number] {
    return {
        url: getUrl(href, routing.defaultLocale),
        lastModified: new Date(),
        changeFrequency: "daily",
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((locale) => [locale, getUrl(href, locale)])
          )
        }
    }
}

function getUrl(href: Href, locale: (typeof routing.locales)[number]) {
    const pathname = getPathname({locale, href});
    return host + pathname;
}