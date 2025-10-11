"use client";

// Hooks
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react'

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

    useEffect(() => {
        fetchRandomGame();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps 
        []
    );

    return (<></>);
}