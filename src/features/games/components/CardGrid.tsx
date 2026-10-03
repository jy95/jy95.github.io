import type { SelectionCategory } from '@/features/selection/selectionDocument';
// MUI
import Grid from '@mui/material/Grid';

// Others
import CardEntry from './CardEntry';

// Types
import type { CardGame } from '@/domain/games/types';

export type GridSize = { xs?: number; sm?: number; md?: number; lg?: number };

export function CardGrid({ items, size, selectable = true, category = "games" }: { items: CardGame[]; size: GridSize; selectable?: boolean; category?: SelectionCategory }) {
    return (
        <Grid container spacing={1} rowSpacing={1}>
            {items.map((game) => (
                <Grid key={game.id} size={size}>
                    <CardEntry category={category} game={game} selectable={selectable} />
                </Grid>
            ))}
        </Grid>
    );
}