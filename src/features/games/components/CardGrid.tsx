// MUI
import Grid from '@mui/material/Grid';

// Others
import CardEntry from './CardEntry';

// Types
import type { CardGame } from '@/domain/games/types';

export type GridSize = { xs?: number; sm?: number; md?: number; lg?: number };

export function CardGrid({ items, size }: { items: CardGame[]; size: GridSize }) {
    return (
        <Grid container spacing={1} rowSpacing={1}>
            {items.map((game) => (
                <Grid key={game.id} size={size}>
                    <CardEntry game={game} />
                </Grid>
            ))}
        </Grid>
    );
}