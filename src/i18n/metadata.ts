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

/** The same image and site fields apply to game and catalog detail pages. */
export function detailOpenGraph(title: string, description: string, imagePath: string): Metadata['openGraph'] {
    return {
        type: 'website',
        siteName: BRAND,
        title,
        description,
        images: [{ url: imagePath, alt: title }],
    };
}
