"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { GAME_FILTER_KEYS, filtersToSearchParams, searchParamsToFilters } from '@/lib/gamesFilterUtils';
import type { GameFilters } from '@/types/gamesFilters';

const NONE: string[] = [];

/**
 * Game filters stored in the URL query string (shareable, survives refresh and back/forward).
 *
 * `router.push` is asynchronous, so right after a change the URL still holds the old
 * query. Reading it directly would make a controlled input (the title field) jump back
 * while the user types. To avoid that we remember, in order, the queries we asked the
 * router for (`queue`) and display the newest one until the URL catches up.
 */
export function useGamesFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const query = useSearchParams().toString();

    const [{ seen, queue }, setState] = useState({ seen: query, queue: NONE });

    // The URL changed: drop the requests it has reached. If it is not one of ours
    // (back/forward, external link) nothing is pending anymore.
    if (seen !== query) {
        const reached = queue.indexOf(query);
        setState({ seen: query, queue: reached === -1 ? NONE : queue.slice(reached + 1) });
    }

    const current = queue.at(-1) ?? query;
    const filters = useMemo(() => searchParamsToFilters(new URLSearchParams(current)), [current]);

    function updateFilters(changes: Partial<GameFilters>) {
        // Keep unrelated params (e.g. ?campaign=x), replace only the filter ones.
        const params = new URLSearchParams(current);

        GAME_FILTER_KEYS.forEach(key => {
            params.delete(key);
        });

        filtersToSearchParams({ ...filters, ...changes }).forEach((value, key) => {
            params.append(key, value);
        });

        const next = params.toString();
        if (next === current) return;

        setState(state => ({ ...state, queue: [...state.queue, next] }));

        // Typing replaces the history entry (no entry per keystroke); other changes add one.
        const navigate = 'title' in changes ? router.replace : router.push;
        navigate(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }

    return { filters, updateFilters };
}