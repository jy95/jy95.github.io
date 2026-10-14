import { hasLocale } from 'next-intl';
import { getSiteUrl } from '@/lib/siteUrl';
import { routing } from '@/i18n/routing';

import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

export const BRAND = 'GamesPassionFR';

export const withBrand = (title: string) => title.includes(BRAND) ? title : `${title} | ${BRAND}`;

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

/** Route identity excludes list filters, sorting, pagination and return-navigation state. */
export function pageMetadata(args: {
    locale: Locale;
    title: string;
    description: string;
    pathnameFor: (locale: Locale) => string;
    imagePath?: string;
}): Metadata {
    const { locale, title, description, pathnameFor, imagePath } = args;
    const imageUrl = new URL('/api/social', getSiteUrl());
    const imageTitle = title.replace(BRAND, '').replace(/\s*\|\s*$/, '').trim() || title;
    imageUrl.search = new URLSearchParams({ locale, title: imageTitle, ...(imagePath ? { artwork: imagePath } : {}) }).toString();
    const images = [{ url: imageUrl.toString(), width: 1200, height: 630, alt: title }];
    return {
        title: withBrand(title),
        description,
        alternates: alternatesFor(locale, pathnameFor),
        openGraph: {
            type: 'website', siteName: BRAND, title, description,
            url: new URL(pathnameFor(locale), getSiteUrl()).toString(),
            locale: locale === 'en' ? 'en_US' : 'fr_FR',
            alternateLocale: routing.locales.filter(l => l !== locale).map(l => l === 'en' ? 'en_US' : 'fr_FR'),
            images,
        },
        twitter: { card: 'summary_large_image', title, description, images },
    };
}
