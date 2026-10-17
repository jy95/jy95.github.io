import { getTranslations } from 'next-intl/server';

import { extractGameCardProps } from '@/domain/games';
import { contentMetadata, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import { loadDlcGroups, loadPublishedGames, toPublishedGame } from '@/lib/gamesData';

import type { Metadata } from 'next';
import type { YTUrlType } from '@/domain/games';
import type { WatchPageProps } from './WatchPage';

async function resolveWatchContent(id: string, type: YTUrlType) {
    // Only published content is offered by the watch routes' identifier catalogue.
    const [games, groups] = await Promise.all([loadPublishedGames(), loadDlcGroups()]);
    const entry = [...games, ...groups.flatMap(group => group.dlcs)].find(game => {
        const identity = extractGameCardProps(game);
        return identity.id === id && identity.url_type === type;
    });
    return entry ? toPublishedGame(entry) : undefined;
}

export async function watchMetadata({ params }: WatchPageProps, type: YTUrlType): Promise<Metadata> {
    const { locale: rawLocale, id } = await params;
    const locale = resolveLocale(rawLocale);
    const game = await resolveWatchContent(id, type);
    // The player accepts arbitrary identifiers. Preserve that behavior, without indexing unknown records.
    if (!game) return { robots: { index: false, follow: false } };

    const t = await getTranslations({ locale, namespace: 'watchMetadata' });
    const description = t('description', { title: game.title });
    const pathname = type === 'PLAYLIST' ? '/playlist/[id]' : '/video/[id]';
    return contentMetadata(locale, language => getPathname({
        locale: language, href: { pathname, params: { id: encodeURIComponent(id) } },
    }), game.title, description, game.imagePath);
}
