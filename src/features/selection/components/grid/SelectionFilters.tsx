import { useTranslations } from 'next-intl';
import AppsIcon from '@mui/icons-material/Apps';
import GamesFilters from '@/app/[locale]/games/_client/GamesFilters';
import ResponsiveSelect from '@/components/common/ResponsiveSelect';

import { SELECTION_CATEGORIES } from '@/domain/selection/categories';
import { isSelectionKind } from '@/domain/selection/categories';
import { SelectionKindIcon } from '../SelectionKindBadge';

// Types
import type { GameFilters } from '@/types/gamesFilters';
import type { SelectionKind } from "@/domain/selection/types";

function KindFilter({
  kind,
  setKind,
}: {
  kind: SelectionKind;
  setKind: (kind: SelectionKind) => void;
}) {
  const t = useTranslations('selection');
  const options = [
    { value: 'all', label: t('categories.all'), icon: <AppsIcon fontSize="small" aria-hidden="true" /> },
    ...SELECTION_CATEGORIES.map(category => ({
      value: category,
      label: t(`categories.${category}`),
      icon: <SelectionKindIcon category={category} />,
    })),
  ];

  return (
    <ResponsiveSelect
      label={t('kinds')}
      value={kind}
      options={options}
      onChange={value => {
        if (isSelectionKind(value)) setKind(value);
      }}
    />
  );
}

type SelectionFiltersProps = {
  kind: SelectionKind;
  onKindChange: (kind: SelectionKind) => void;
  filters: GameFilters;
  onFiltersChange: (filters: GameFilters) => void;
};

export function SelectionFilters({
  kind,
  onKindChange,
  filters,
  onFiltersChange,
}: SelectionFiltersProps) {
  return (
    <>
      <GamesFilters filters={filters} onChange={onFiltersChange} />
      <KindFilter kind={kind} setKind={onKindChange} />
    </>
  );
}