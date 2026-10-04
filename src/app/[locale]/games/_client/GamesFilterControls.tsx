import Box from '@mui/material/Box';
import GenresSelect from '@/features/games/components/GenresSelect';
import PlatformSelect from '@/features/games/components/PlatformSelect';
import ReleaseDateFilter from '@/features/games/components/ReleaseDateFilter';
import type { GameFilters } from '@/types/gamesFilters';

export type SecondaryFilters = Pick<GameFilters, 'platform' | 'genres' | 'releaseDateFrom' | 'releaseDateTo'>;

export default function GamesFilterControls({ filters, onChange }: {
    filters: SecondaryFilters;
    onChange: (changes: SecondaryFilters) => void;
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 3, minWidth: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <PlatformSelect value={filters.platform} onChange={platform => onChange({ platform })} />
            </Box>
            <Box sx={{ flex: 2, minWidth: 0, '& .MuiChip-root': { maxWidth: '100%' } }}>
                <GenresSelect value={filters.genres ?? []} onChange={genres => onChange({ genres })} />
            </Box>
            <Box sx={{ flex: { md: '2 1 280px' }, minWidth: 0 }}>
                <ReleaseDateFilter filters={filters} onChange={onChange} />
            </Box>
        </Box>
    );
}
