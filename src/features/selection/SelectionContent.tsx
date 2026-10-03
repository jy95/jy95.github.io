import { useTranslations } from 'next-intl';
import Grid from '@mui/material/Grid';
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { SelectionKindFilter } from './SelectionKindFilter';
import GamesFilters from '@/app/[locale]/games/_client/GamesFilters';
import { SelectionActions } from './SelectionActions';
import { SelectionEmptyState } from './SelectionEmptyState';
import { SelectionCards } from './SelectionCards';
import type { SelectionPageModel } from './useSelectionPage';

function SelectionResults({ model }: { model: SelectionPageModel }) {
    const common = useTranslations('common');
    if (model.decodeError) return null;
    if (!model.hasEntries) return <SelectionEmptyState shared={model.shared} />;
    return <>
        <GamesFilters filters={model.filters} onChange={model.updateFilters} />
        <SelectionKindFilter kind={model.kind} setKind={model.setKind} />
        {model.visibleEntries.length > 0
            ? <SelectionCards entries={model.visibleEntries} onDetail={model.setDetail} />
            : <Typography role="status">{common('noResults')}</Typography>}
        <Grid container sx={{ justifyContent: 'center' }}>
            <LoadingButton disabled={!model.hasMore} onClick={model.loadMore} label={common('loadMore')} />
        </Grid>
    </>;
}

export function SelectionContent({ model }: { model: SelectionPageModel }) {
    const t = useTranslations('selection');
    const common = useTranslations('common');
    if (model.loading) return <CircularProgress aria-label={model.decoding ? t('processing') : common('loading')} />;
    return <>
        {!model.storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
        <Typography role="status" aria-live="polite">{t('count', { count: model.entries.length })}</Typography>
        {model.unavailable > 0 && <Alert severity="info">{t('unavailable', { count: model.unavailable })}</Alert>}
        <SelectionActions shared={model.shared} hasEntries={model.hasEntries} hasSelection={model.hasSelection}
            canImport={model.canImport} encoding={model.encoding}
            onImport={model.importSelection} onClear={model.openClear} onShare={model.shareSelection} />
        <SelectionResults model={model} />
    </>;
}
