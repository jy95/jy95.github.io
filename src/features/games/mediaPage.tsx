import YTPlayer from '@/components/YTPlayer/Player';
import { findMediaMetadata } from '@/domain/games/mediaTitles';
import RandomButton from '@/features/games/components/RandomButton';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Locale } from 'next-intl';

type MediaType = 'video' | 'playlist';
type Props = { params: Promise<{ id: string; locale: Locale }> };

export function createMediaPage(type: MediaType) {
    async function generateMetadata({ params }: Props) {
        const { id, locale } = await params;
        const metadata = await findMediaMetadata(type === 'video' ? 'videoId' : 'playlistId', id);
        if (!metadata) notFound();
        const { title, imagePath } = metadata;
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
