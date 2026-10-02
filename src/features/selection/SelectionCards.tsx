import Grid from '@mui/material/Grid';
import { CardGrid } from '@/features/games/components/CardGrid';
import BaseCard from '@/features/games/components/BaseCard';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from './SelectionButton';
import type { SelectionEntry } from './catalogue';

export function SelectionCards({ entries, onDetail }: { entries: SelectionEntry[]; onDetail: (entry: SelectionEntry) => void }) {
    const published = entries.flatMap(entry => entry.source === 'published' ? [entry.game] : []);
    if (published.length === entries.length) return <CardGrid items={published} size={{ xs: 6, md: 4, lg: 2 }} />;
    return (
        <Grid container spacing={1} rowSpacing={1}>
            {entries.map(entry => (
                <Grid key={entry.selectionId} size={{ xs: 6, md: 4, lg: 2 }}>
                    <BaseCard
                        item={entry.game}
                        onClick={() => onDetail(entry)}
                        overlayPersistent
                        overlaySlot={game => <GameCardOverlay game={game} />}
                        actionsSlot={game => <SelectionButton id={entry.selectionId} title={game.title} />}
                    />
                </Grid>
            ))}
        </Grid>
    );
}
