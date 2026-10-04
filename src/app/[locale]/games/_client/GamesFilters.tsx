import { useId, useState } from 'react';
import { useTranslations } from "next-intl";

// MUI
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Custom
import TitleFilter from "@/features/games/components/TitleFilter";
import SortSelect from "@/features/games/components/SortSelect";
import MobileFiltersDialog from './MobileFiltersDialog';
import DesktopFiltersPanel from './DesktopFiltersPanel';
import GamesFilterTrigger from './GamesFilterTrigger';
import type { GameFilters } from '@/types/gamesFilters';

type Props = {
    filters: GameFilters;
    onChange: (changes: Partial<GameFilters>) => void;
};

export default function GamesFilters({ filters, onChange }: Props) {
    const t = useTranslations("gamesLibrary");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [previousMobile, setPreviousMobile] = useState(isMobile);
    if (previousMobile !== isMobile) {
        setPreviousMobile(isMobile);
        setFiltersOpen(false);
    }
    const filtersId = useId();
    const triggerId = useId();
    const hasReleasePeriod = filters.releaseDateFrom !== undefined || filters.releaseDateTo !== undefined;
    const activeFilterCount = Number(filters.platform !== undefined)
        + Number(Boolean(filters.genres?.length))
        + Number(hasReleasePeriod);
    return (
        <Box sx={{ pt: { xs: 3, sm: 1 }, mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider', minWidth: 0 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: { xs: 1, sm: 2 },
                }}
            >
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' }, maxWidth: { md: 560 }, minWidth: 0 }}>
                    <TitleFilter value={filters.title ?? ''} onChange={title => onChange({ title })} />
                </Box>
                <GamesFilterTrigger
                    triggerId={triggerId}
                    filtersId={filtersId}
                    isMobile={isMobile}
                    filtersOpen={filtersOpen}
                    activeFilterCount={activeFilterCount}
                    label={t('filtersButtonLabel')}
                    onClick={() => {
                        setFiltersOpen(open => !open);
                    }}
                />
                <Box sx={{ ml: 'auto', flex: { xs: '1 1 160px', md: '0 0 280px' }, maxWidth: { xs: 240, md: 280 }, minWidth: 0 }}>
                    <SortSelect value={filters.sort} onChange={sort => onChange({ sort })} />
                </Box>
            </Box>
            {isMobile ? (
                filtersOpen && <MobileFiltersDialog filters={filters} filtersId={filtersId} onChange={onChange} onClose={() => setFiltersOpen(false)} />
            ) : (
                <DesktopFiltersPanel open={filtersOpen} filters={filters} filtersId={filtersId} triggerId={triggerId} onChange={onChange} />
            )}
        </Box>
    );
}
