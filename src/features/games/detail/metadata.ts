import { getTranslations } from 'next-intl/server';

import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { resolveGameDetails } from '@/lib/gameDetails';

import type { Metadata } from 'next';

async function safeResolve(id: string) {
    try {
        return await resolveGameDetails(id);
    } catch {
        // Metadata must never take the page down; fall back to the layout defaults.
        return undefined;
    }
}

export async function gameDetailMetadata(rawLocale: string, id: string): Promise<Metadata> {
    const locale = resolveLocale(rawLocale);
    const details = await safeResolve(id);

    // Unknown id: the page renders notFound(), so keep it out of the index.
    if (!details) return { robots: { index: false, follow: false }, openGraph: null, twitter: null, alternates: null };

    const t = await getTranslations({ locale, namespace: 'detailMetadata.game' });
    const { game, source } = details;
    const description = t(source, { title: game.title });

    return pageMetadata({
        locale, title: game.title, description, imagePath: game.imagePath,
        // proxy.ts forces an explicit locale prefix, including French.
        pathnameFor: l => `/${l}/games/detail/${encodeURIComponent(id)}`,
    });
}
