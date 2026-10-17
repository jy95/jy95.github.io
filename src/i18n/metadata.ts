import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

export const BRAND = 'GamesPassionFR';

export const withBrand = (title: string) => `${title} | ${BRAND}`;

/** Same fallback as the root layout: unknown locales behave like the default one. */
export function resolveLocale(raw: string): Locale {
    return hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
}

/** Canonical URL for the current locale + hreflang entries for every locale. */
export function alternatesFor(
    locale: Locale,
    pathnameFor: (locale: Locale) => string
): NonNullable<Metadata['alternates']> {
    return {
        canonical: pathnameFor(locale),
        languages: Object.fromEntries(routing.locales.map((l) => [l, pathnameFor(l)])),
        // Next.js replaces the layout's alternates object rather than merging it.
        types: {
            'application/rss+xml': '/rss.xml',
            'application/feed+json': '/feed.json',
        },
    };
}

/** Complete nested values: Next.js replaces, rather than deep-merges, Open Graph. */
export function contentMetadata(
    locale: Locale,
    pathnameFor: (locale: Locale) => string,
    title: string,
    description: string,
    imagePath?: string,
): Metadata {
    const pathname = pathnameFor(locale);
    return {
        title,
        description,
        alternates: alternatesFor(locale, language => language === locale ? pathname : pathnameFor(language)),
        openGraph: {
            type: 'website',
            siteName: BRAND,
            title,
            description,
            url: pathname,
            // The application supports languages, with no regional variants defined.
            locale,
            alternateLocale: routing.locales.filter(language => language !== locale),
            ...(imagePath ? { images: [{ url: imagePath, alt: title }] } : {}),
        },
    };
}
