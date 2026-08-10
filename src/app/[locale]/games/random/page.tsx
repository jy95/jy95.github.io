"use client";

// Hooks
import { useEffect } from 'react'
import { useNavigateToRandomGame } from '@/hooks/useNavigateToRandomGame';

export default function Random() {
    const navigateToRandomGame = useNavigateToRandomGame();

    useEffect(() => {
        navigateToRandomGame();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps 
        []
    );

    return (<></>);
}