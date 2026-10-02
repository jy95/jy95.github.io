'use client';

import { memo, useState } from 'react';
import Box from '@mui/material/Box';
import CardEntry from '@/features/games/components/CardEntry';
import { SelectionKindBadge } from './SelectionKindBadge';
import BaseCard from '@/features/games/components/BaseCard';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from './SelectionButton';
import type { SelectionEntry } from './catalogue';
import { useSelectionVirtualGrid } from './useSelectionVirtualGrid';

type Props = { entries: SelectionEntry[]; onDetail: (entry: SelectionEntry) => void };

export const SelectionCards = memo(function SelectionCards({ entries, onDetail }: Props) {
    const { container, columns, cardSize, stride, height, start, end } = useSelectionVirtualGrid(entries);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const visible = entries.slice(start, end).map((entry, offset) => ({ entry, index: start + offset }));
    // Keep a focused card mounted if the user scrolls with the keyboard/mouse.
    const focusedIndex = focusedId ? entries.findIndex(entry => entry.selectionId === focusedId) : -1;
    if (focusedIndex >= 0 && (focusedIndex < start || focusedIndex >= end)) {
        visible.push({ entry: entries[focusedIndex], index: focusedIndex });
        visible.sort((a, b) => a.index - b.index);
    }

    return (
        <Box ref={container} sx={{ position: 'relative', flexShrink: 0, height }}
            onBlurCapture={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocusedId(null);
            }}>
            {visible.map(({ entry, index }) => (
                <Box key={entry.selectionId} onFocusCapture={() => setFocusedId(entry.selectionId)}
                    sx={{ position: 'absolute', top: Math.floor(index / columns) * stride, left: (index % columns) * stride, width: cardSize }}>
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
