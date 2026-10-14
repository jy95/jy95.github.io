import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import type { Metadata } from 'next';

export function selectionMetadata(rawLocale: string, entries: string | string[] | undefined): Metadata {
    const locale = resolveLocale(rawLocale);
    const messages = locale === 'en' ? en : fr;
    // Presence identifies a shared link, not a validated document. Never decompress untrusted input here.
    const shared = entries !== undefined;
    const metadata = pageMetadata({ locale,
        title: shared ? messages.selection.sharedTitle : messages.selection.title,
        description: shared ? messages.selection.sharedDescription : messages.selection.description,
        pathnameFor: l => {
            const pathname = getPathname({ locale: l, href: '/selection' });
            if (!shared) return pathname;
            const query = new URLSearchParams();
            for (const entry of typeof entries === 'string' ? [entries] : entries ?? []) query.append('entries', entry);
            return `${pathname}?${query}`;
        },
    });
    // Both browser-local and shared selections are private utility pages, including malformed links.
    return { ...metadata, robots: { index: false, follow: true } };
}
