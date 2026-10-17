import { getTranslations } from 'next-intl/server';

import { extractGameCardProps } from '@/domain/games';
import { contentMetadata, resolveLocale, withBrand } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import { loadDlcGroups, loadPublishedGames, toPublishedGame } from '@/lib/gamesData';

import type { Metadata } from 'next';
import type { YTUrlType } from '@/domain/games';
import type { WatchPageProps } from './WatchPage';

export async function watchMetadata({ params }: WatchPageProps, type: YTUrlType): Promise<Metadata> {
    const { locale: rawLocale, id } = await params;
    const locale = resolveLocale(rawLocale);
    // Only published content is offered by the watch routes' identifier catalogue.
    const [games, groups] = await Promise.all([loadPublishedGames(), loadDlcGroups()]);
    const entry = [...games, ...groups.flatMap(group => group.dlcs)].find(game => {
        const identity = extractGameCardProps(game);
        return identity.id === id && identity.url_type === type;
    });
    // The player accepts arbitrary identifiers. Preserve that behavior, without indexing unknown records.
    if (!entry) return { robots: { index: false, follow: false } };

    const game = toPublishedGame(entry);
    const t = await getTranslations({ locale, namespace: 'watchMetadata' });
    const title = t('title', { title: game.title });
    const description = t('description', { title: game.title });
    const pathname = type === 'PLAYLIST' ? '/playlist/[id]' : '/video/[id]';
    return {
        ...contentMetadata(locale, language => getPathname({
            locale: language, href: { pathname, params: { id: encodeURIComponent(id) } },
        }), title, description, game.imagePath, game.title),
        title: withBrand(title),
    };
}
