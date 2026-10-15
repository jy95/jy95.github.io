import { getTranslations } from 'next-intl/server';

import YTPlayer from '@/components/YTPlayer/Player';
import RandomButton from '@/features/games/components/RandomButton';
import type { Locale } from 'next-intl';
import type { YTUrlType } from '@/domain/games';

export type WatchPageProps = {
    params: Promise<{ id: string; locale: Locale }>;
};

export async function watchStaticParams(type: YTUrlType) {
    const identifiers = (await import('@/app/api/random/identifiers.json')).default;
    const key = type === 'PLAYLIST' ? 'playlistId' : 'videoId';
    return identifiers.flatMap(entry => entry[key] === undefined ? [] : [{ id: String(entry[key]) }]);
}

export async function renderWatchPage({ params }: WatchPageProps, type: YTUrlType) {
    const { id } = await params;
    const t = await getTranslations('gamesLibrary');
    return <>
        <YTPlayer type={type} identifier={id} />
        <RandomButton label={t('randomButtonLabel')} />
    </>;
}
