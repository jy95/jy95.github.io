"use client";

import { useEffect, useRef } from 'react';
import { useNavigateToRandomGame } from '@/hooks/useNavigateToRandomGame';

export default function Random() {
    const { navigateToRandomGame } = useNavigateToRandomGame();
    const attempted = useRef(false);

    useEffect(() => {
        // Effect replay or a new navigation callback must not start another automatic request.
        if (attempted.current) return;
        attempted.current = true;
        void navigateToRandomGame();
    }, [navigateToRandomGame]);

    return null;
}
