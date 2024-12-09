import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import YTPlayer from "@/components/YTPlayer/Player";
import RandomButton from '@/components/GamesView/RandomButton';

// https://nextjs.org/docs/app/api-reference/file-conventions/page#props
type Props = {
    params: Promise<{ id: string, locale: "en" | "fr" }>
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
    const { id, locale } = parameters
    const identifier = id as string;

    // Enable static rendering
    setRequestLocale(locale);

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