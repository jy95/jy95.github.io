import { getTranslations } from 'next-intl/server';

import { metadataImage } from '@/i18n/metadataImage';
import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { resolveGameDetails } from '@/lib/gameDetails';

import type { DetailPageProps } from '@/features/catalog/metadata';
import type { Metadata } from 'next';

async function safeResolve(id: string) {
    try {
        return await resolveGameDetails(id);
    } catch {
        // Metadata must never take the page down; keep failed lookups out of the index.
        return undefined;
    }
}

export async function gameDetailMetadata(rawLocale: string, id: string): Promise<Metadata> {
    const locale = resolveLocale(rawLocale);
    const details = await safeResolve(id);

    // Unknown id: the page renders notFound(), so keep it out of the index.
    if (!details) return { robots: { index: false, follow: false } };

    const t = await getTranslations({ locale, namespace: 'detailMetadata.game' });
    const { game, source } = details;
    const description = t(source, { title: game.title });

    const images = await getTranslations({ locale, namespace: 'detailMetadata.images' });
    return pageMetadata({
        locale, title: game.title, description,
        // The game-detail middleware requires explicit prefixes in both languages.
        pathnameFor: (language) => `/${language}/games/detail/${encodeURIComponent(id)}`,
        image: await metadataImage(game.imagePath, images('game', { name: game.title })),
    });
}

export async function gameDetailRouteMetadata({ params }: DetailPageProps): Promise<Metadata> {
    const { locale, id } = await params;
    return gameDetailMetadata(locale, id);
}
