"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
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

/**
 * Shared navigation logic for "watch a random game".
 *
 * Guards against three related failure modes:
 * - Concurrent calls: a second click while a request is already in flight
 *   is ignored instead of firing a second /api/random request whose
 *   response could resolve out of order relative to the first.
 * - Failed / malformed responses: the response status and shape are
 *   validated, so a 5xx or unexpected payload never triggers a navigation
 *   with garbage data (e.g. `params: { id: undefined }`).
 * - Stale navigation after unmount: the request is aborted on unmount, so
 *   if the user switches language while this component's page is loading
 *   or waiting on /api/random, the abandoned request can no longer push a
 *   route computed under the *previous* locale once it (would have)
 *   resolved.
 */
export function useNavigateToRandomGame(): UseNavigateToRandomGameResult {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isPendingRef = useRef(false);
    const isMountedRef = useRef(true);

    // Cancel any in-flight request if this component unmounts (e.g. the
    // route changed underneath it because the locale was switched, or
    // React Strict Mode is replaying the effect in development).
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            abortControllerRef.current?.abort();
            // Clear the pending flag immediately so a Strict Mode replay
            // (mount -> cleanup -> mount) is able to start the required
            // replacement request instead of seeing a stale "pending"
            // ref from the aborted one.
            isPendingRef.current = false;
        };
    }, []);

    const navigateToRandomGame = useCallback(() => {
        // Ignore extra clicks while a request is already pending.
        if (isPendingRef.current) {
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        isPendingRef.current = true;
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

                // The request may have been aborted between the fetch
                // resolving and this point (unmount race) — never navigate
                // on stale data.
                if (controller.signal.aborted) {
                    return;
                }

                router.push({
                    pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
                    params: { id: data.identifier }
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    // Expected on unmount/cleanup — not a real error.
                    return;
                }
                console.error('Failed to navigate to a random game:', error);
            } finally {
                // Only clear the pending state for this request if it's
                // still the current one. An aborted request's cleanup may
                // already have reset the flags for a newer, still-pending
                // request — don't stomp on that request's state.
                if (abortControllerRef.current === controller) {
                    isPendingRef.current = false;
                    if (isMountedRef.current) {
                        setIsPending(false);
                    }
                }
            }
        })();
    }, [router]);

    return { navigateToRandomGame, isPending };
}