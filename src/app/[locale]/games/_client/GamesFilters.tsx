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
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';

// Custom
import GenresSelect from "@/features/games/components/GenresSelect";
import PlatformSelect from "@/features/games/components/PlatformSelect";
import TitleFilter from "@/features/games/components/TitleFilter";
import SortSelect from "@/features/games/components/SortSelect";

type Props = {
    filters: GameFilters;
    onChange: (changes: Partial<GameFilters>) => void;
};

export default function GamesFilters({ filters, onChange }: Props) {
    const t = useTranslations("gamesLibrary");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [filtersOpen, setFiltersOpen] = useState(false);
    const filtersId = useId();
    const triggerId = useId();
    const titleId = useId();
    const activeFilterCount = Number(Boolean(filters.title?.trim()))
        + Number(filters.platform !== undefined)
        + Number(Boolean(filters.genres?.length));

    const filterControls = (
        <Grid container spacing={{ xs: 2, md: 1.5 }} sx={{ minWidth: 0 }}>
            <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
                <TitleFilter value={filters.title ?? ""} onChange={title => onChange({ title })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} sx={{ minWidth: 0 }}>
                <PlatformSelect value={filters.platform} onChange={platform => onChange({ platform })} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0, '& .MuiChip-root': { maxWidth: '100%' } }}>
                <GenresSelect value={filters.genres ?? []} onChange={genres => onChange({ genres })} />
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider', minWidth: 0 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: { xs: 1, sm: 2 },
                }}
            >
                <Button
                    id={triggerId}
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    endIcon={isMobile ? undefined : <ExpandMoreIcon sx={{ transform: filtersOpen ? 'rotate(180deg)' : undefined }} />}
                    aria-expanded={filtersOpen}
                    aria-controls={filtersOpen ? filtersId : undefined}
                    aria-haspopup={isMobile ? 'dialog' : undefined}
                    onClick={() => setFiltersOpen(open => !open)}
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
                <Box sx={{ width: { xs: '100%', md: 280 }, maxWidth: 280, minWidth: 0 }}>
                    <SortSelect value={filters.sort} onChange={sort => onChange({ sort })} />
                </Box>
            </Box>
            {isMobile ? (
                <Dialog
                    id={filtersId}
                    open={filtersOpen}
                    onClose={() => setFiltersOpen(false)}
                    aria-labelledby={titleId}
                    fullWidth
                    maxWidth="sm"
                    slotProps={{ paper: { sx: { m: 2, width: 'calc(100% - 32px)' } } }}
                >
                    <DialogTitle id={titleId}>{t("filtersButtonLabel")}</DialogTitle>
                    <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2, overflowX: 'hidden' }}>
                        {filterControls}
                    </DialogContent>
                    <DialogActions sx={{ px: 2, pb: 2 }}>
                        <Button onClick={() => setFiltersOpen(false)} sx={{ minHeight: 44 }}>
                            {t("sortForm.cancelButton")}
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
