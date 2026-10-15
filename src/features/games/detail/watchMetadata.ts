import { getTranslations } from 'next-intl/server';

import { buildWatchRoute, extractGameCardProps } from '@/domain/games/youtube';
import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import { loadPublishedGames, loadDlcGroups, loadPlanningGames, toPublishedGame } from '@/lib/gamesData';

import type { RawGame, YTUrlType } from '@/domain/games';
import type { DetailPageProps } from '@/features/catalog/metadata';
import type { Metadata } from 'next';

async function findWatchRecord(id: string, type: YTUrlType) {
    const matches = (game: RawGame) => type === 'PLAYLIST'
        ? 'playlistId' in game && game.playlistId === id
        : 'videoId' in game && game.videoId === id;
    const published = (await loadPublishedGames()).find(matches);
    if (published) return published;
    const dlc = (await loadDlcGroups()).flatMap(group => group.dlcs).find(matches);
    if (dlc) return dlc;
    return (await loadPlanningGames()).find(matches);
}

export async function watchMetadata({ params }: DetailPageProps, type: YTUrlType): Promise<Metadata> {
    const { locale: rawLocale, id } = await params;
    const locale = resolveLocale(rawLocale);
    let record;
    try {
        record = await findWatchRecord(id, type);
    } catch {
        return { robots: { index: false, follow: false } };
    }
    if (!record) return { robots: { index: false, follow: false } };
    const t = await getTranslations({ locale, namespace: 'detailMetadata' });
    // Covers use the catalog identity, which may be a playlist even on a video route.
    const game = toPublishedGame(record);
    const identity = extractGameCardProps(record);
    const image = identity.id ? { url: game.imagePath, alt: t('images.game', { name: game.title }) } : undefined;
    return pageMetadata({
        locale, title: game.title,
        description: t(type === 'PLAYLIST' ? 'watch.playlist' : 'watch.video', { title: game.title }),
        pathnameFor: language => getPathname({ locale: language, href: buildWatchRoute(type, encodeURIComponent(id)) }),
        image,
    });
}
