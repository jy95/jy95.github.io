import YTPlayer from '@/components/YTPlayer/Player';
import RandomButton from '@/features/games/components/RandomButton';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { getMediaApiMetadata } from '@/lib/server/apiTitles';
import { getTranslations } from 'next-intl/server';

import type { Locale } from 'next-intl';

type MediaType = 'video' | 'playlist';
type Props = { params: Promise<{ id: string; locale: Locale }> };

export function createMediaPage(type: MediaType) {
    async function generateMetadata({ params }: Props) {
        const { id, locale } = await params;
        const { title, imagePath } = await getMediaApiMetadata(type, id);
        return staticSectionMetadata(locale, type, {
            title: `${title} | GamesPassionFR`,
            openGraph: { images: [imagePath] },
        });
    }

    async function generateStaticParams() {
        const identifiers = (await import('@/app/api/random/identifiers.json')).default;
        const key = type === 'video' ? 'videoId' : 'playlistId';
        return identifiers.flatMap((entry) => entry[key] ? [{ id: entry[key] }] : []);
    }

    async function Page({ params }: Props) {
        const { id } = await params;
        const t = await getTranslations('gamesLibrary');

        return (
            <>
                <YTPlayer type={type === 'video' ? 'VIDEO' : 'PLAYLIST'} identifier={id} />
                <RandomButton label={t('randomButtonLabel')} />
            </>
        );
    }

    return { generateMetadata, generateStaticParams, Page };
}
