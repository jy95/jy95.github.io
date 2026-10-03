import { useTranslations } from 'next-intl';
import AppsIcon from '@mui/icons-material/Apps';
import ResponsiveSelect from '@/components/common/ResponsiveSelect';
import { SelectionKindIcon } from './SelectionKindBadge';
import { SELECTION_CATEGORIES, isSelectionKind, type SelectionKind } from './documentTypes';

// Re-exported so existing imports keep working.
export type { SelectionKind };

type Props = { kind: SelectionKind; setKind: (kind: SelectionKind) => void };

export function SelectionKindFilter({ kind, setKind }: Props) {
    const t = useTranslations('selection');
    return <ResponsiveSelect label={t('kinds')} value={kind}
        options={[
            { value: 'all', label: t('categories.all'), icon: <AppsIcon fontSize="small" aria-hidden="true" /> },
            ...SELECTION_CATEGORIES.map(category => ({ value: category, label: t(`categories.${category}`), icon: <SelectionKindIcon category={category} /> })),
        ]}
        onChange={value => { if (isSelectionKind(value)) setKind(value); }} />;
}