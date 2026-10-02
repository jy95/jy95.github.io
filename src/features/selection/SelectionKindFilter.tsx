import { useTranslations } from 'next-intl';
import ResponsiveSelect from '@/components/common/ResponsiveSelect';
import { SelectionKindIcon } from './SelectionKindBadge';
import { SELECTION_CATEGORIES, type SelectionCategory } from './documentTypes';

type Props = { enabledKinds: readonly SelectionCategory[]; toggleKind: (category: SelectionCategory) => void };

export function SelectionKindFilter({ enabledKinds, toggleKind }: Props) {
    const t = useTranslations('selection');
    return <ResponsiveSelect multiple label={t('kinds')} value={enabledKinds}
        options={SELECTION_CATEGORIES.map(category => ({ value: category, label: t(`categories.${category}`), icon: <SelectionKindIcon category={category} /> }))}
        onChange={enabled => {
            for (const category of SELECTION_CATEGORIES) {
                if (enabled.includes(category) !== enabledKinds.includes(category)) toggleKind(category);
            }
        }} />;
}
