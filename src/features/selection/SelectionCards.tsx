import Grid from '@mui/material/Grid';
import CardEntry from '@/features/games/components/CardEntry';
import BaseCard from '@/features/games/components/BaseCard';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from './SelectionButton';
import { SelectionKindBadge } from './SelectionKindBadge';
import type { SelectionEntry } from './catalogue';

function PublishedCard({ entry }: { entry: SelectionEntry }) {
    return <CardEntry game={entry.game} badge={<SelectionKindBadge category={entry.category} />} />;
}

function CategorizedCard({
    entry,
    onDetail,
}: {
    entry: SelectionEntry;
    onDetail: (entry: SelectionEntry) => void;
}) {
    return (
        <BaseCard
            item={entry.game}
            badgesSlot={() => <SelectionKindBadge category={entry.category} />}
            onClick={() => onDetail(entry)}
            overlayPersistent
            overlaySlot={game => <GameCardOverlay game={game} />}
            actionsSlot={game => <SelectionButton id={entry.selectionId} title={game.title} />}
        />
    );
}

export function SelectionCards({ entries, onDetail }: { entries: SelectionEntry[]; onDetail: (entry: SelectionEntry) => void }) {
    return (
        <Grid container spacing={1} rowSpacing={1}>
            {entries.map(entry => (
                <Grid key={entry.selectionId} size={{ xs: 6, md: 4, lg: 2 }}>
                    {entry.source === 'published'
                        ? <PublishedCard entry={entry} />
                        : <CategorizedCard entry={entry} onDetail={onDetail} />}
                </Grid>
            ))}
        </Grid>
    );
}
