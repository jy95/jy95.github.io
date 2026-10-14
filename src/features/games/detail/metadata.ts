import { getTranslations } from 'next-intl/server';

import { alternatesFor, detailOpenGraph, resolveLocale, withBrand } from '@/i18n/metadata';
import { resolveGameDetails } from '@/lib/gameDetails';

import type { DetailPageProps } from '@/features/catalog/metadata';
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
    if (!details) return { robots: { index: false, follow: false } };

    const t = await getTranslations({ locale, namespace: 'detailMetadata.game' });
    const { game, source } = details;
    const description = t(source, { title: game.title });

    return {
        title: withBrand(game.title),
        description,
        // proxy.ts forces the locale prefix on game detail URLs, even for the default locale.
        alternates: alternatesFor(locale, (l) => `/${l}/games/detail/${encodeURIComponent(id)}`),
        openGraph: detailOpenGraph(game.title, description, game.imagePath),
    };
}

export async function gameDetailRouteMetadata({ params }: DetailPageProps): Promise<Metadata> {
    const { locale, id } = await params;
    return gameDetailMetadata(locale, id);
}
