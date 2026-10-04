"use client";

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { buildWatchRoute } from '@/domain/games/youtube';
import type { RandomAnswer } from '@/app/api/random/route';

export function useNavigateToRandomGame() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const navigateToRandomGame = async () => {
        // Prevent multiple random-game requests from being triggered at once.
        if (isPending) return;

        setIsPending(true);

        try {
            // The API returns a RandomAnswer containing the target type and identifier.
            const response = await fetch('/api/random');

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const { type, identifier }: RandomAnswer = await response.json();

            // Build the watch URL and navigate to the randomly selected game.
            router.push(buildWatchRoute(type, identifier));
        } catch (error) {
            // Allow the user to try again if the request or navigation fails.
            console.error('Failed to navigate to a random game:', error);
            setIsPending(false);
        }
    };

    return { navigateToRandomGame, isPending };
}