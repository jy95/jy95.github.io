import { BRAND, resolveLocale } from '@/i18n/metadata';
import { getSiteUrl } from '@/lib/siteUrl';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import type { Metadata } from 'next';

export function defaultMetadata(rawLocale: string): Metadata {
    const messages = resolveLocale(rawLocale) === 'en' ? en : fr;
    // Route-specific URLs and social fields belong to children, not this shared layout.
    return {
        title: BRAND,
        description: messages.siteMetadata.description,
        metadataBase: new URL(getSiteUrl()),
        alternates: { types: { 'application/rss+xml': '/rss.xml', 'application/feed+json': '/feed.json' } },
    };
}
