import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';

type Props = {
    triggerId: string;
    filtersId: string;
    isMobile: boolean;
    filtersOpen: boolean;
    activeFilterCount: number;
    label: string;
    onClick: () => void;
};

export default function GamesFilterTrigger({ triggerId, filtersId, isMobile, filtersOpen, activeFilterCount, label, onClick }: Props) {
    return (
        <Button
            id={triggerId}
            variant="outlined"
            startIcon={<FilterListIcon />}
            endIcon={isMobile ? undefined : <ExpandMoreIcon sx={{ transform: filtersOpen ? 'rotate(180deg)' : undefined }} />}
            aria-expanded={filtersOpen}
            aria-controls={filtersOpen ? filtersId : undefined}
            aria-haspopup={isMobile ? 'dialog' : undefined}
            onClick={onClick}
            sx={{ minHeight: 44, flexShrink: 0 }}
        >
            {label}
            {activeFilterCount > 0 && (
                <Box
                    component="span"
                    sx={{ ml: 1, px: 0.75, borderRadius: 1, bgcolor: 'action.selected', color: 'text.secondary', fontSize: '0.75rem' }}
                >
                    {activeFilterCount}
                </Box>
            )}
        </Button>
    );
}
