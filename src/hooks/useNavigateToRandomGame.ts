"use client";

import { useRouter } from '@/i18n/routing';
import type { RandomAnswer } from "@/app/api/random/route";

/**
 * Shared navigation logic for "watch a random game", previously duplicated
 * between RandomButton and the /games/random redirect page.
 */
export function useNavigateToRandomGame() {
    const router = useRouter();

    return async function navigateToRandomGame() {
        const response = await fetch('/api/random');
        const data = await response.json() as RandomAnswer;
        router.push({
            pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: data.identifier }
        });
    };
}