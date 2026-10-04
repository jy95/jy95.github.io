import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import GamesFilterControls from './GamesFilterControls';
import type { SecondaryFilters } from './GamesFilterControls';

type Props = {
    open: boolean;
    filtersId: string;
    triggerId: string;
    filters: SecondaryFilters;
    onChange: (changes: SecondaryFilters) => void;
};

export default function DesktopFiltersPanel({ open, filtersId, triggerId, filters, onChange }: Props) {
    return (
        <Collapse in={open} unmountOnExit>
            <Box
                id={filtersId}
                role="region"
                aria-labelledby={triggerId}
                sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
            >
                <GamesFilterControls filters={filters} onChange={onChange} />
            </Box>
        </Collapse>
    );
}
