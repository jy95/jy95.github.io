"use client";

import { useState } from "react";

type GalleryArgs<S> = { filter: string; sort: S; pageSize: number };

export function useCatalogGalleryState<S extends string>(initialSort: S, resetPages: (args: GalleryArgs<S>) => void) {
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState(initialSort);
    const args = { filter, sort, pageSize: 12 };
    const onFilterChange = (next: string) => {
        resetPages({ ...args, filter: next });
        setFilter(next);
    };
    const onSortChange = (next: S) => {
        resetPages({ ...args, sort: next });
        setSort(next);
    };
    return { args, onFilterChange, onSortChange };
}
