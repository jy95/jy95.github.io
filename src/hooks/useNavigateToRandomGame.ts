"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
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
 * IMPORTANT: this does NOT rely on the calling component unmounting to
 * cancel a stale request. Next.js frequently keeps a client component
 * instance mounted across a locale-only soft navigation (same component
 * type + position in the tree), so a `useEffect` cleanup tied only to
 * unmount never runs when the user switches language mid-request — a
 * pending /api/random fetch would then resolve and push using the OLD
 * locale, visibly flipping the language back.
 *
 * Instead:
 * - `locale` (and `pathname`) are watched directly; a change aborts any
 *   in-flight request, regardless of whether the component unmounts.
 * - The current locale is re-checked immediately before navigating, as a
 *   redundant guard against the abort signal and the fetch resolution
 *   racing in the same tick.
 */
export function useNavigateToRandomGame(): UseNavigateToRandomGameResult {
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const [isPending, setIsPending] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isPendingRef = useRef(false);

    // Always holds the *current* router/locale, read fresh inside the async
    // callback below instead of relying on the (possibly stale) closure
    // captured when the user clicked.
    const contextRef = useRef({ router, locale });
    useEffect(() => {
        contextRef.current = { router, locale };
    }, [router, locale]);

    // Abort any in-flight request whenever locale or pathname changes —
    // this fires on every navigation, not just on unmount.
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [locale, pathname]);

    const navigateToRandomGame = useCallback(() => {
        // Ignore extra clicks while a request is already pending.
        if (isPendingRef.current) {
            return;
        }

        const requestedLocale = locale;
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

                // Bail out if aborted, or if the locale changed between the
                // click and now — pushing here would land the user back on
                // a stale locale.
                if (controller.signal.aborted || contextRef.current.locale !== requestedLocale) {
                    return;
                }

                contextRef.current.router.push({
                    pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
                    params: { id: data.identifier }
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    // Expected when locale/pathname changed mid-request —
                    // not a real error.
                    return;
                }
                console.error('Failed to navigate to a random game:', error);
            } finally {
                // Always reset — the component may never unmount, so a
                // pending flag left `true` after an abort would leave the
                // button permanently disabled.
                isPendingRef.current = false;
                setIsPending(false);
            }
        })();
    }, [locale]);

    return { navigateToRandomGame, isPending };
}
