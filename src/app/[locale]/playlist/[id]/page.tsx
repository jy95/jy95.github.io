import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import YTPlayer from "@/components/YTPlayer/Player";
import RandomButton from '@/components/GamesView/RandomButton';

import type {Locale} from 'next-intl';

// https://nextjs.org/docs/app/api-reference/file-conventions/page#props
type Props = {
    params: Promise<{ id: string, locale: Locale }>
}

export async function generateStaticParams() {
    const identifiers = (await import("@/app/api/random/identifiers.json")).default;
    const playlists = identifiers.filter(i => i.playlistId !== undefined);

    return playlists.map((pl) => ({
        id: pl.playlistId,
    }));
}

export default async function PlaylistPage({ params } : Props) {

    const parameters = await params;
    const { id, locale } = parameters
    const identifier = id as string;

    // Enable static rendering
    setRequestLocale(locale);

    // Retrieve translation
    const t = await getTranslations("gamesLibrary");
    const randomButtonLabel = t("randomButtonLabel");

    return (
        <>
            <YTPlayer type="PLAYLIST" identifier={identifier}/>
            <RandomButton label={randomButtonLabel} />
        </>
    )
}