import {getTranslations} from 'next-intl/server';
import YTPlayer from "@/components/YTPlayer/Player";
import RandomButton from '@/features/games/components/RandomButton';
import { getMediaTitle } from '@/domain/games/mediaTitles';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { notFound } from 'next/navigation';

import type {Locale} from 'next-intl';

// https://nextjs.org/docs/app/api-reference/file-conventions/page#props
type Props = {
    params: Promise<{ id: string, locale: Locale }>
}

export async function generateMetadata({ params }: Props) {
    const { id, locale } = await params;
    const title = getMediaTitle('videoId', id);
    if (!title) notFound();
    return staticSectionMetadata(locale, 'video', { title: `${title} | GamesPassionFR` });
}

export async function generateStaticParams() {
    const identifiers = (await import("@/app/api/random/identifiers.json")).default;
    const videos = identifiers.filter(i => i.videoId !== undefined);

    return videos.map((vid) => ({
        id: vid.videoId,
    }));
}

export default async function PlaylistPage({ params } : Props) {

    const parameters = await params;
    const { id } = parameters
    const identifier = id as string;
    if (!getMediaTitle('videoId', identifier)) notFound();

    // Retrieve translation
    const t = await getTranslations("gamesLibrary");
    const randomButtonLabel = t("randomButtonLabel");

    return (
        <>
            <YTPlayer type="VIDEO" identifier={identifier}/>
            <RandomButton label={randomButtonLabel} />
        </>
    )
}
