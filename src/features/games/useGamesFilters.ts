"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useReducer, useRef } from 'react';
import { GAME_FILTER_KEYS, filtersToSearchParams, searchParamsToFilters } from '@/lib/gamesFilterUtils';
import type { GameFilters } from '@/types/gamesFilters';

/** The URL is the filter state, including on refresh and browser navigation. */
export function useGamesFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, refresh] = useReducer(count => count + 1, 0);
    const observed = searchParams.toString();
    const pending = useRef({ observed, params: new URLSearchParams(observed), requests: [] as string[] });
    if (pending.current.observed !== observed) {
        if (pending.current.requests.includes(observed)) {
            pending.current.observed = observed;
            if (observed === pending.current.requests.at(-1)) pending.current.requests = [];
        } else {
            pending.current = { observed, params: new URLSearchParams(observed), requests: [] };
        }
    }
    const filters = searchParamsToFilters(
        pending.current.requests.length ? pending.current.params : new URLSearchParams(observed)
    );

    function updateFilters(changes: Partial<GameFilters>) {
        const params = new URLSearchParams(pending.current.params);
        const next = filtersToSearchParams({ ...searchParamsToFilters(params), ...changes });
        for (const key of GAME_FILTER_KEYS) params.delete(key);
        next.forEach((value, key) => { params.append(key, value); });
        if (params.toString() === pending.current.params.toString()) return;
        pending.current.params = params;
        pending.current.requests.push(params.toString());
        refresh();

        const href = `${pathname}${params.size ? `?${params}` : ''}`;
        if ('title' in changes) router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
    }

    return { filters, updateFilters };
}
