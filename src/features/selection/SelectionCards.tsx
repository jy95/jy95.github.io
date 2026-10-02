'use client';

import { memo, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import CardEntry from '@/features/games/components/CardEntry';
import { SelectionKindBadge } from './SelectionKindBadge';
import BaseCard from '@/features/games/components/BaseCard';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from './SelectionButton';
import type { SelectionEntry } from './catalogue';

type Props = { entries: SelectionEntry[]; onDetail: (entry: SelectionEntry) => void };
const OVERSCAN = 2;

export const SelectionCards = memo(function SelectionCards({ entries, onDetail }: Props) {
    const theme = useTheme();
    const container = useRef<HTMLDivElement>(null);
    const previousEntries = useRef(entries);
    const [layout, setLayout] = useState({ width: 600, columns: 2, top: 0, viewport: 768 });
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const gap = Number.parseFloat(theme.spacing(1));

    useLayoutEffect(() => {
        const element = container.current!;
        let scrollParent = element.parentElement;
        while (scrollParent && !/(auto|scroll)/.test(`${getComputedStyle(scrollParent).overflowY} ${getComputedStyle(scrollParent).overflow}`)) {
            scrollParent = scrollParent.parentElement;
        }
        const scrollTarget = scrollParent ?? window;
        const viewportTop = () => scrollParent ? scrollParent.getBoundingClientRect().top + scrollParent.clientTop : 0;
        const update = () => {
            const rect = element.getBoundingClientRect();
            const columns = window.innerWidth >= theme.breakpoints.values.lg ? 6
                : window.innerWidth >= theme.breakpoints.values.md ? 3 : 2;
            setLayout({ width: rect.width || 600, columns, top: viewportTop() - rect.top, viewport: scrollParent?.clientHeight || window.innerHeight });
        };
        // A new filter/sort must start with visible results even after a deep scroll.
        if (previousEntries.current !== entries && element.getBoundingClientRect().top < viewportTop()) {
            scrollTarget.scrollTo({ top: (scrollParent?.scrollTop ?? window.scrollY) + element.getBoundingClientRect().top - viewportTop() });
        }
        previousEntries.current = entries;
        update();
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
        observer?.observe(element);
        if (scrollParent) observer?.observe(scrollParent);
        scrollTarget.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            observer?.disconnect();
            scrollTarget.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [entries, theme.breakpoints.values.lg, theme.breakpoints.values.md]);

    // Both card variants use square media; all other content is absolutely positioned.
    const cardSize = (layout.width - gap * (layout.columns - 1)) / layout.columns;
    const stride = cardSize + gap;
    const rows = Math.ceil(entries.length / layout.columns);
    const first = Math.max(0, Math.min(rows - 1, Math.floor(layout.top / stride) - OVERSCAN));
    const last = Math.min(rows - 1, Math.max(first, Math.floor((layout.top + layout.viewport) / stride) + OVERSCAN));
    const start = first * layout.columns;
    const end = Math.max(start, (last + 1) * layout.columns);
    const visible = entries.slice(start, end).map((entry, offset) => ({ entry, index: start + offset }));
    // Keep a focused card mounted if the user scrolls with the keyboard/mouse.
    const focusedIndex = focusedId ? entries.findIndex(entry => entry.selectionId === focusedId) : -1;
    if (focusedIndex >= 0 && (focusedIndex < start || focusedIndex >= end)) {
        visible.push({ entry: entries[focusedIndex], index: focusedIndex });
        visible.sort((a, b) => a.index - b.index);
    }

    return (
        <Box ref={container} sx={{ position: 'relative', flexShrink: 0, height: Math.max(0, rows * stride - gap) }}
            onBlurCapture={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null);
            }}>
            {visible.map(({ entry, index }) => (
                <Box key={entry.selectionId} onFocusCapture={() => setFocusedId(entry.selectionId)}
                    sx={{ position: 'absolute', top: Math.floor(index / layout.columns) * stride, left: (index % layout.columns) * stride, width: cardSize }}>
                    {entry.source === 'published'
                        ? <CardEntry game={entry.game} badge={<SelectionKindBadge category={entry.category} />} />
                        : <BaseCard
                            item={entry.game}
                            badgesSlot={() => <SelectionKindBadge category={entry.category} />}
                            onClick={() => onDetail(entry)}
                            overlayPersistent
                            overlaySlot={game => <GameCardOverlay game={game} />}
                            actionsSlot={game => <SelectionButton id={entry.selectionId} title={game.title} />}
                        />}
                </Box>
            ))}
        </Box>
    );
});
