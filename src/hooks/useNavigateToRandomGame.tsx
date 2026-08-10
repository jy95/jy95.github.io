"use client";

import { useCallback } from "react";
import { useRouter } from "`@/i18n/routing`";

import type { RandomAnswer } from "`@/app/api/random/route`";

type NavigationResult =
    | { success: true }
    | { success: false; error: string };

export default function useNavigateToRandomGame() {
    const router = useRouter();

    return useCallback(async (): Promise<NavigationResult> => {
        try {
            const response = await fetch("/api/random");

            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP error: ${response.status}`
                };
            }

            const data = await response.json() as RandomAnswer;

            if (data.type !== "PLAYLIST" && data.type !== "VIDEO") {
                return {
                    success: false,
                    error: "Invalid response type"
                };
            }

            if (typeof data.identifier !== "string" || data.identifier.length === 0) {
                return {
                    success: false,
                    error: "Invalid response identifier"
                };
            }

            router.push({
                pathname: data.type === "PLAYLIST"
                    ? "/playlist/[id]"
                    : "/video/[id]",
                params: { id: data.identifier }
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }, [router]);
}
