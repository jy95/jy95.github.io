"use client";

// Hooks
import { useRouter } from '@/i18n/routing';
import { useEffectEvent } from 'react'

export default function Random() {
    const router = useRouter();

    const fetchRandomGame = async () => {
        const response = await fetch('/api/random');
        const data = await response.json();
        router.push({
            pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: data.identifier }
        });
    }

    const onLoad = useEffectEvent(() => {
        fetchRandomGame();
    });

    onLoad();

    return (<></>);
}