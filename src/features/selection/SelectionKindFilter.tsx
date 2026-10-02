import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import AppsIcon from '@mui/icons-material/Apps';
import ResponsiveSelect from '@/components/common/ResponsiveSelect';
import { SelectionKindIcon } from './SelectionKindBadge';
import { SELECTION_CATEGORIES, type SelectionCategory } from './documentTypes';

export type SelectionKind = 'all' | SelectionCategory;
type Props = { kind: SelectionKind; setKind: (kind: SelectionKind) => void };

export function SelectionKindFilter({ kind, setKind }: Props) {
    const t = useTranslations('selection');
    const options = useMemo(() => [
        { value: 'all', label: t('categories.all'), icon: <AppsIcon fontSize="small" aria-hidden="true" /> },
        ...SELECTION_CATEGORIES.map(category => ({ value: category, label: t(`categories.${category}`), icon: <SelectionKindIcon category={category} /> })),
    ], [t]);

    return <ResponsiveSelect label={t('kinds')} value={kind}
        options={options}
        onChange={value => setKind(value as SelectionKind)} />;
}
