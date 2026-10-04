import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import GamesFilterControls from './GamesFilterControls';
import type { SecondaryFilters } from './GamesFilterControls';

type Props = {
    filters: SecondaryFilters;
    filtersId: string;
    onChange: (changes: SecondaryFilters) => void;
    onClose: () => void;
};

/** Mounted on opening so each draft starts from the currently applied filters. */
export default function MobileFiltersDialog({ filters, filtersId, onChange, onClose }: Props) {
    const t = useTranslations('gamesLibrary');
    const titleId = useId();
    const [draft, setDraft] = useState<SecondaryFilters>(() => ({
        platform: filters.platform,
        genres: filters.genres,
        releaseDateFrom: filters.releaseDateFrom,
        releaseDateTo: filters.releaseDateTo,
    }));
    return (
        <Dialog
            open
            onClose={onClose}
            aria-labelledby={titleId}
            fullScreen
            slotProps={{ paper: { id: filtersId, sx: { height: '100dvh', maxHeight: '100dvh' } } }}
        >
            <DialogTitle component="div" id={`${titleId}-container`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                <Box component="h2" id={titleId} sx={{ m: 0, font: 'inherit' }}>{t("filtersButtonLabel")}</Box>
                <IconButton aria-label={t('filterActions.close')} onClick={onClose} sx={{ ml: 'auto', minWidth: 44, minHeight: 44 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 3, overflowX: 'hidden' }}>
                <GamesFilterControls filters={draft} onChange={changes => setDraft(current => ({ ...current, ...changes }))} />
            </DialogContent>
            <DialogActions sx={{ p: 2, pb: 'max(16px, env(safe-area-inset-bottom))', gap: 1, flexShrink: 0 }}>
                <Button variant="outlined" onClick={() => setDraft({ platform: undefined, genres: [], releaseDateFrom: undefined, releaseDateTo: undefined })} sx={{ minHeight: 44, flex: 1 }}>
                    {t('filterActions.clear')}
                </Button>
                <Button variant="contained" onClick={() => { onChange(draft); onClose(); }} sx={{ minHeight: 44, flex: 1 }}>
                    {t('filterActions.apply')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
