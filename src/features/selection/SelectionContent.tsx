import { useId } from 'react';
import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { SelectionKindIcon } from './SelectionKindBadge';
import { SELECTION_CATEGORIES } from './documentTypes';
import GamesFilters from '@/app/[locale]/games/_client/GamesFilters';
import { SelectionActions } from './SelectionActions';
import { SelectionEmptyState } from './SelectionEmptyState';
import { SelectionCards } from './SelectionCards';
import type { SelectionPageModel } from './useSelectionPage';

function SelectionResults({ model }: { model: SelectionPageModel }) {
    const kindId = useId();
    const common = useTranslations('common');
    const t = useTranslations('selection');
    if (model.decoded.kind === 'error') return null;
    if (model.entries.length === 0) return <SelectionEmptyState shared={model.shared} />;
    return <>
        <GamesFilters filters={model.filters} onChange={model.updateFilters} />
        <FormControl fullWidth>
            <InputLabel id={`${kindId}-label`}>{t('kinds')}</InputLabel>
            <Select multiple id={kindId} labelId={`${kindId}-label`} label={t('kinds')}
                value={model.enabledKinds}
                onChange={event => {
                    const value = event.target.value;
                    const enabled = typeof value === 'string' ? value.split(',') : value;
                    for (const category of SELECTION_CATEGORIES) {
                        if (enabled.includes(category) !== model.enabledKinds.includes(category)) model.toggleKind(category);
                    }
                }}
                renderValue={enabled => <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    {enabled.map(category => <Stack key={category} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <SelectionKindIcon category={category} />
                        <span>{t(`categories.${category}`)}</span>
                    </Stack>)}
                </Stack>}
            >
                {SELECTION_CATEGORIES.map(category => <MenuItem key={category} value={category}>
                    <Checkbox checked={model.enabledKinds.includes(category)} tabIndex={-1}
                        slotProps={{ input: { 'aria-hidden': true } }} sx={{ pointerEvents: 'none' }} />
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <SelectionKindIcon category={category} />
                        <span>{t(`categories.${category}`)}</span>
                    </Stack>
                </MenuItem>)}
            </Select>
        </FormControl>
        {model.visibleEntries.length > 0
            ? <SelectionCards entries={model.visibleEntries} onDetail={model.setDetail} />
            : <Typography role="status">{common('noResults')}</Typography>}
    </>;
}

export function SelectionContent({ model }: { model: SelectionPageModel }) {
    const t = useTranslations('selection');
    const common = useTranslations('common');
    if (model.loading) return <CircularProgress aria-label={model.decoded.kind === 'processing' ? t('processing') : common('loading')} />;
    return <>
        {!model.storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
        <Typography role="status" aria-live="polite">{t('count', { count: model.entries.length })}</Typography>
        {model.unavailable > 0 && <Alert severity="info">{t('unavailable', { count: model.unavailable })}</Alert>}
        <SelectionActions shared={model.shared} hasEntries={model.entries.length > 0} hasSelection={model.hasSelection}
            canImport={model.canImport} encoding={model.sharing.state.kind === 'processing'}
            onImport={model.importSelection} onClear={model.openClear} onShare={model.shareSelection} />
        <SelectionResults model={model} />
    </>;
}
