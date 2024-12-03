"use client";

export async function generateStaticParams() {
    const identifiers = (await import("@/app/api/random/identifiers.json")).default;
    const playlists = identifiers.filter(i => i.playlistId !== undefined);

    return playlists.map((pl) => ({
        id: pl.playlistId,
    }));
}

import { useParams } from 'next/navigation'
import YTPlayer from "@/components/YTPlayer/Player";
import RandomButton from '@/components/GamesView/RandomButton';

export default function PlaylistPage() {

    const { id } = useParams();
    const identifier = id as string;

    return (
        <>
            <YTPlayer type="PLAYLIST" identifier={identifier}/>
            <RandomButton />
        </>
    )
}