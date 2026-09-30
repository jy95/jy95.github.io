"use client";

import type { GameFilters } from '@/types/gamesFilters';
import { useId, useState } from 'react';
import { useTranslations } from "next-intl";

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';

// Custom
import GenresSelect from "@/features/games/components/GenresSelect";
import PlatformSelect from "@/features/games/components/PlatformSelect";
import TitleFilter from "@/features/games/components/TitleFilter";
import SortSelect from "@/features/games/components/SortSelect";
import ReleaseDateFilter from "@/features/games/components/ReleaseDateFilter";

type SecondaryFilters = Pick<GameFilters, 'platform' | 'genres' | 'releaseDateFrom' | 'releaseDateTo'>;

type Props = {
    filters: GameFilters;
    onChange: (changes: Partial<GameFilters>) => void;
};

export default function GamesFilters({ filters, onChange }: Props) {
    const t = useTranslations("gamesLibrary");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [filtersOpen, setFiltersOpen] = useState(false);
    // Only secondary filters are staged; the URL remains the applied source of truth.
    const [draft, setDraft] = useState<SecondaryFilters>({});
    const [previousMobile, setPreviousMobile] = useState(isMobile);
    if (previousMobile !== isMobile) {
        setPreviousMobile(isMobile);
        setFiltersOpen(false);
    }
    const filtersId = useId();
    const triggerId = useId();
    const titleId = useId();
    const hasReleasePeriod = filters.releaseDateFrom !== undefined || filters.releaseDateTo !== undefined;
    const activeFilterCount = Number(filters.platform !== undefined)
        + Number(Boolean(filters.genres?.length))
        + Number(hasReleasePeriod);
    const displayedFilters = isMobile ? draft : filters;
    const changeSecondaryFilters = (changes: SecondaryFilters) => {
        if (isMobile) setDraft(current => ({ ...current, ...changes }));
        else onChange(changes);
    };

    const filterControls = (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 3, minWidth: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <PlatformSelect value={displayedFilters.platform} onChange={platform => changeSecondaryFilters({ platform })} />
            </Box>
            <Box sx={{ flex: 2, minWidth: 0, '& .MuiChip-root': { maxWidth: '100%' } }}>
                <GenresSelect value={displayedFilters.genres ?? []} onChange={genres => changeSecondaryFilters({ genres })} />
            </Box>
            <Box sx={{ flex: { md: '2 1 280px' }, minWidth: 0 }}>
                <ReleaseDateFilter filters={displayedFilters} onChange={changeSecondaryFilters} />
            </Box>
        </Box>
    );

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
                <Button
                    id={triggerId}
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    endIcon={isMobile ? undefined : <ExpandMoreIcon sx={{ transform: filtersOpen ? 'rotate(180deg)' : undefined }} />}
                    aria-expanded={filtersOpen}
                    aria-controls={filtersOpen ? filtersId : undefined}
                    aria-haspopup={isMobile ? 'dialog' : undefined}
                    onClick={() => {
                        if (isMobile) setDraft({ platform: filters.platform, genres: filters.genres, releaseDateFrom: filters.releaseDateFrom, releaseDateTo: filters.releaseDateTo });
                        setFiltersOpen(open => !open);
                    }}
                    sx={{ minHeight: 44, flexShrink: 0 }}
                >
                    {t("filtersButtonLabel")}
                    {activeFilterCount > 0 && (
                        <Box
                            component="span"
                            sx={{ ml: 1, px: 0.75, borderRadius: 1, bgcolor: 'action.selected', color: 'text.secondary', fontSize: '0.75rem' }}
                        >
                            {activeFilterCount}
                        </Box>
                    )}
                </Button>
                <Box sx={{ ml: 'auto', flex: { xs: '1 1 160px', md: '0 0 280px' }, maxWidth: { xs: 240, md: 280 }, minWidth: 0 }}>
                    <SortSelect value={filters.sort} onChange={sort => onChange({ sort })} />
                </Box>
            </Box>
            {isMobile ? (
                <Dialog
                    open={filtersOpen}
                    onClose={() => setFiltersOpen(false)}
                    aria-labelledby={titleId}
                    fullScreen
                    slotProps={{ paper: { id: filtersId, sx: { height: '100dvh', maxHeight: '100dvh' } } }}
                >
                    <DialogTitle component="div" id={`${titleId}-container`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon />
                        <Box component="h2" id={titleId} sx={{ m: 0, font: 'inherit' }}>{t("filtersButtonLabel")}</Box>
                        <IconButton aria-label={t('filterActions.close')} onClick={() => setFiltersOpen(false)} sx={{ ml: 'auto', minWidth: 44, minHeight: 44 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 3, overflowX: 'hidden' }}>
                        {filterControls}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pb: 'max(16px, env(safe-area-inset-bottom))', gap: 1, flexShrink: 0 }}>
                        <Button variant="outlined" onClick={() => setDraft({ platform: undefined, genres: [], releaseDateFrom: undefined, releaseDateTo: undefined })} sx={{ minHeight: 44, flex: 1 }}>
                            {t('filterActions.clear')}
                        </Button>
                        <Button variant="contained" onClick={() => { onChange(draft); setFiltersOpen(false); }} sx={{ minHeight: 44, flex: 1 }}>
                            {t('filterActions.apply')}
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <Collapse in={filtersOpen} unmountOnExit>
                    <Box
                        id={filtersId}
                        role="region"
                        aria-labelledby={triggerId}
                        sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
                    >
                        {filterControls}
                    </Box>
                </Collapse>
            )}
        </Box>
    );
}
