"use client";

import { useParams } from 'next/navigation'
import YTPlayer from "@/components/YTPlayer/Player";

export default function PlaylistPage() {

    const { id } = useParams();
    const identifier = id as string;

    return (
        <YTPlayer type="VIDEO" identifier={identifier}/>
    )
}