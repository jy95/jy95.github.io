"use client";

import { useSearchParams } from 'next/navigation';
import { filtersToSearchParams, searchParamsToFilters } from '@/lib/gamesFilterUtils';
import type { GameFilters } from '@/types/gamesFilters';

const FILTER_PARAMS = ['selected_title', 'selected_platform', 'selected_genres', 'sort'] as const;

/** The URL is the filter state, including on refresh and browser navigation. */
export function useGamesFilters() {
    const searchParams = useSearchParams();
    const filters = searchParamsToFilters(new URLSearchParams(searchParams.toString()));

    function updateFilters(changes: Partial<GameFilters>) {
        // Read the latest URL so consecutive changes cannot overwrite one another.
        const url = new URL(window.location.href);
        const next = filtersToSearchParams({ ...searchParamsToFilters(url.searchParams), ...changes });
        for (const key of FILTER_PARAMS) url.searchParams.delete(key);
        next.forEach((value, key) => url.searchParams.append(key, value));
        const href = `${url.pathname}${url.search}${url.hash}`;
        if (href === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;

        // Next's native history integration updates useSearchParams without a server navigation.
        // Typing replaces the current entry to avoid one history entry per character.
        if ('title' in changes) window.history.replaceState(null, '', href);
        else window.history.pushState(null, '', href);
    }

    return { filters, updateFilters };
}
