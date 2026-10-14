import { getTranslations } from 'next-intl/server';
import { pageMetadata, resolveLocale } from '@/i18n/metadata';
import { getPathname } from '@/i18n/routing';
import { loadPublishedGames, loadDlcGroups, toPublishedGame } from '@/lib/gamesData';
import { buildCardGame } from '@/domain/games';
import { COVER_PATHS } from '@/domain/games/coverPaths';
import type { CardGame } from '@/domain/games';
import type { Metadata } from 'next';

async function findSubject(kind: 'playlist' | 'video', id: string): Promise<CardGame | undefined> {
    const matches = (game: CardGame) => kind === 'playlist'
        ? 'playlistId' in game && game.playlistId === id
        : 'videoId' in game && game.videoId === id;
    const games = (await loadPublishedGames()).map(toPublishedGame);
    const dlcs = (await loadDlcGroups()).flatMap(group => group.dlcs.map(toPublishedGame));
    const reviews = (await import('@/app/api/tests/tests.json')).default.map(game => buildCardGame(game, COVER_PATHS.tests));
    return [...games, ...dlcs, ...reviews].find(matches);
}

export async function mediaMetadata(rawLocale: string, kind: 'playlist' | 'video', id: string): Promise<Metadata> {
    const locale = resolveLocale(rawLocale);
    const t = await getTranslations({ locale, namespace: 'mediaMetadata' });
    let subject: CardGame | undefined;
    try { subject = await findSubject(kind, id); } catch { /* Keep the player available if catalog lookup fails. */ }
    const title = subject ? t(`${kind}Title`, { title: subject.title }) : t(`${kind}FallbackTitle`);
    const description = subject ? t(`${kind}Description`, { title: subject.title }) : t(`${kind}FallbackDescription`);
    return pageMetadata({ locale, title, description, imagePath: subject?.imagePath,
        pathnameFor: l => getPathname({ locale: l, href: { pathname: kind === 'playlist' ? '/playlist/[id]' : '/video/[id]', params: { id } } }),
    });
}
