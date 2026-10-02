import { useTranslations } from 'next-intl';
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
    if (model.decoded.kind === 'error') return null;
    if (model.entries.length === 0) return <SelectionEmptyState shared={model.shared} />;
    return <>
        <GamesFilters filters={model.filters} onChange={model.updateFilters} />
        <SelectionKindFilter kind={model.kind} setKind={model.setKind} />
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
