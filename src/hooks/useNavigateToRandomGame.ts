"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { buildWatchRoute } from "@/domain/games/youtube";
import type { RandomAnswer } from "@/app/api/random/route";

type UseNavigateToRandomGameResult = {
    navigateToRandomGame: () => void;
    isPending: boolean;
};

function isRandomAnswer(value: unknown): value is RandomAnswer {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.identifier === 'string' &&
        (candidate.type === 'PLAYLIST' || candidate.type === 'VIDEO')
    );
}

/** Cancels stale random requests on locale/path changes and unmount. */
export function useNavigateToRandomGame(): UseNavigateToRandomGameResult {
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const [isPending, setIsPending] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Locale and pathname changes must cancel the active request, even though cleanup does not read them.
    useEffect(() => () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setIsPending(false);
    }, [locale, pathname]);

    const navigateToRandomGame = useCallback(() => {
        // Ignore extra clicks while a request is already pending.
        if (abortControllerRef.current) {
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsPending(true);

        (async () => {
            try {
                const response = await fetch('/api/random', { signal: controller.signal });

                if (!response.ok) {
                    throw new Error(`/api/random returned status ${response.status}`);
                }

                const data: unknown = await response.json();

                if (!isRandomAnswer(data)) {
                    throw new Error('/api/random returned a malformed payload');
                }

                if (controller.signal.aborted) return;
                router.push(buildWatchRoute(data.type, data.identifier));
            } catch (error) {
                if (controller.signal.aborted) {
                    // Expected when locale/pathname changed mid-request —
                    // not a real error.
                    return;
                }
                console.error('Failed to navigate to a random game:', error);
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                    setIsPending(false);
                }
            }
        })();
    }, [router]);

    return { navigateToRandomGame, isPending };
}
