// https://nextjs.org/docs/app/api-reference/file-conventions/page#props
type Props = {
    params: Promise<{ id: string }>
}

export async function generateStaticParams() {
    const identifiers = (await import("@/app/api/random/identifiers.json")).default;
    const playlists = identifiers.filter(i => i.playlistId !== undefined);

    return playlists.map((pl) => ({
        id: pl.playlistId,
    }));
}

import YTPlayer from "@/components/YTPlayer/Player";
import RandomButton from '@/components/GamesView/RandomButton';

export default async function PlaylistPage({ params } : Props) {

    const id = (await params).id
    const identifier = id as string;

    return (
        <>
            <YTPlayer type="PLAYLIST" identifier={identifier}/>
            <RandomButton />
        </>
    )
}