import {routing, getPathname} from '@/i18n/routing';
import { getSiteUrl } from '@/lib/siteUrl';

import type {Href} from '@/i18n/routing';
import type { MetadataRoute } from 'next';

type pathnames = typeof routing.pathnames;
type AvailableRoutes = keyof pathnames;
type StaticRoute = Exclude<AvailableRoutes, `${string}[${string}]`>;

// Routes to exclude, SEO doesn't like redirects
const EXCLUDED_ROUTES: AvailableRoutes[] = [
  '/'
];

const host = getSiteUrl();

function isStaticPath(path: AvailableRoutes): path is Exclude<AvailableRoutes, `${string}[${string}]`> {
  // 1. Check if route isn't dynamic (ex: [id])
  const isDynamic = /\[.+\]/.test(path);

  // 2. Check if route isn't manually excluded
  const isExcluded = EXCLUDED_ROUTES.includes(path);
  
  return !isDynamic && !isExcluded;
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