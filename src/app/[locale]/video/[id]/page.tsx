"use client";

export async function generateStaticParams() {
    const identifiers = (await import("@/app/api/random/identifiers.json")).default;
    const videos = identifiers.filter(i => i.videoId !== undefined);

    return videos.map((vid) => ({
        id: vid.videoId,
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
            <YTPlayer type="VIDEO" identifier={identifier}/>
            <RandomButton />
        </>
    )
}