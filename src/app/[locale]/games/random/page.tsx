"use client";

// Hooks
import { useEffect } from 'react'
import useNavigateToRandomGame from '@/hooks/useNavigateToRandomGame';

export default function Random() {
    const navigateToRandomGame = useNavigateToRandomGame();

    useEffect(() => {
        // call the centralized navigation routine on mount
        void navigateToRandomGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<></>);
}
