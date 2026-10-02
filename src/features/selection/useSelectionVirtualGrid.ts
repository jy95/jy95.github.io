'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { calculateVirtualGrid, type GridViewport } from './virtualGrid';
import type { SelectionEntry } from './catalogue';

function findScrollParent(element: HTMLElement): HTMLElement | null {
    let parent = element.parentElement;
    while (parent) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(`${style.overflowY} ${style.overflow}`)) return parent;
        parent = parent.parentElement;
    }
    return null;
}

export function useSelectionVirtualGrid(entries: SelectionEntry[]) {
    const theme = useTheme();
    const mediumBreakpoint = theme.breakpoints.values.md;
    const largeBreakpoint = theme.breakpoints.values.lg;
    const gap = Number.parseFloat(theme.spacing(1));
    const container = useRef<HTMLDivElement>(null);
    const previousEntries = useRef(entries);
    const measurement = useRef<{ resetScroll: () => void; update: () => void } | null>(null);
    const [layout, setLayout] = useState<GridViewport>({ width: 600, columns: 2, top: 0, viewport: 768 });

    useLayoutEffect(() => {
        const element = container.current!;
        const scrollParent = findScrollParent(element);
        const scrollTarget = scrollParent ?? window;
        const viewportTop = () => scrollParent ? scrollParent.getBoundingClientRect().top + scrollParent.clientTop : 0;
        const update = () => {
            const rect = element.getBoundingClientRect();
            const columns = window.innerWidth >= largeBreakpoint ? 6
                : window.innerWidth >= mediumBreakpoint ? 3 : 2;
            setLayout({ width: rect.width || 600, columns, top: viewportTop() - rect.top, viewport: scrollParent?.clientHeight || window.innerHeight });
        };
        const resetScroll = () => {
            const offset = element.getBoundingClientRect().top - viewportTop();
            if (offset < 0) {
                const currentScroll = scrollParent?.scrollTop ?? window.scrollY;
                scrollTarget.scrollTo({ top: currentScroll + offset });
            }
        };
        measurement.current = { resetScroll, update };
        update();
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
        observer?.observe(element);
        if (scrollParent) observer?.observe(scrollParent);
        scrollTarget.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            measurement.current = null;
            observer?.disconnect();
            scrollTarget.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [largeBreakpoint, mediumBreakpoint]);

    useLayoutEffect(() => {
        if (previousEntries.current !== entries) {
            // Filtering and sorting return to visible results without resubscribing.
            measurement.current?.resetScroll();
            measurement.current?.update();
        }
        previousEntries.current = entries;
    }, [entries]);

    return { container, columns: layout.columns, ...calculateVirtualGrid(entries.length, layout, gap) };
}
