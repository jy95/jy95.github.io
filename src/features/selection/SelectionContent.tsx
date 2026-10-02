import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { GroupedGamesAccordion } from '@/features/games/components/GroupedGamesAccordion';
import GamesFilters from '@/app/[locale]/games/_client/GamesFilters';
import { SelectionActions } from './SelectionActions';
import { SelectionEmptyState } from './SelectionEmptyState';
import { SelectionCards } from './SelectionCards';
import type { SelectionPageModel } from './useSelectionPage';

function SelectionResults({ model }: { model: SelectionPageModel }) {
    const common = useTranslations('common');
    const t = useTranslations('selection');
    if (model.decoded.kind === 'error') return null;
    if (model.entries.length === 0) return <SelectionEmptyState shared={model.shared} />;
    return <>
        <GamesFilters filters={model.filters} onChange={model.updateFilters} />
        <GroupedGamesAccordion
            groups={model.sections.map(section => ({ ...section, name: `${t(`categories.${section.id}`)} — ${t('sectionCount', { selected: section.entries.length, matching: section.items.length })}` }))}
            itemSize={{ xs: 6, md: 4, lg: 2 }}
            defaultExpanded
            renderContent={section => section.items.length > 0
                ? <SelectionCards entries={section.items} onDetail={model.setDetail} />
                : <Typography>{section.entries.length > 0 ? common('noResults') : t('sectionEmpty')}</Typography>}
        />
    </>;
}

export function SelectionContent({ model }: { model: SelectionPageModel }) {
    const t = useTranslations('selection');
    const common = useTranslations('common');
    if (model.loading) return <CircularProgress aria-label={model.decoded.kind === 'processing' ? t('processing') : common('loading')} />;
    return <>
        {!model.storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
        <Typography role="status">{t('count', { count: model.entries.length })}</Typography>
        {model.unavailable > 0 && <Alert severity="info">{t('unavailable', { count: model.unavailable })}</Alert>}
        <SelectionActions shared={model.shared} hasEntries={model.entries.length > 0} hasSelection={model.hasSelection}
            canImport={model.canImport} encoding={model.sharing.state.kind === 'processing'}
            onImport={model.importSelection} onClear={model.openClear} onShare={model.shareSelection} />
        <SelectionResults model={model} />
    </>;
}
