'use client';

import { memo } from 'react';
import Grid from '@mui/material/Grid';
import CardEntry from '@/features/games/components/CardEntry';
import { SelectionKindBadge } from './SelectionKindBadge';
import BaseCard from '@/features/games/components/BaseCard';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from './SelectionButton';
import type { SelectionEntry } from './catalogue';

type Props = { entries: SelectionEntry[]; onDetail: (entry: SelectionEntry) => void };

export const SelectionCards = memo(function SelectionCards({ entries, onDetail }: Props) {
    return (
        <Grid container spacing={1} rowSpacing={1}>
            {entries.map(entry => (
                <Grid key={entry.selectionId} size={{ xs: 6, md: 4, lg: 2 }}>
                    {entry.source === 'published'
                        ? <CardEntry category={entry.category} game={entry.game} badge={<SelectionKindBadge category={entry.category} />} />
                        : <BaseCard
                            item={entry.game}
                            badgesSlot={() => <SelectionKindBadge category={entry.category} />}
                            onClick={() => onDetail(entry)}
                            overlayPersistent
                            overlaySlot={game => <GameCardOverlay game={game} />}
                            actionsSlot={game => <SelectionButton id={game.id} category={entry.category} title={game.title} />}
                        />}
                </Grid>
            ))}
        </Grid>
    );
});
