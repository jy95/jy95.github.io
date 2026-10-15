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

/** Child social objects are complete because Next.js merges metadata shallowly. */
export function pageMetadata({ locale, title, description, pathnameFor, image, absoluteTitle = false }: {
    locale: Locale;
    title: string;
    description: string;
    pathnameFor: (locale: Locale) => string;
    image?: { url: string; alt: string; width?: number; height?: number; type?: string };
    absoluteTitle?: boolean;
}): Metadata {
    const socialTitle = absoluteTitle ? title : withBrand(title);
    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        alternates: alternatesFor(locale, pathnameFor),
        openGraph: {
            type: 'website', siteName: BRAND, title: socialTitle, description,
            url: pathnameFor(locale),
            locale: locale === 'fr' ? 'fr_FR' : 'en_US',
            alternateLocale: [locale === 'fr' ? 'en_US' : 'fr_FR'],
            ...(image ? { images: [image] } : {}),
        },
    };
}
