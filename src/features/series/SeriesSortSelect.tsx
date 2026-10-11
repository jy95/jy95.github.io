"use client";

import { useTranslations } from 'next-intl';

import NameCountSortSelect from '@/features/catalog/NameCountSortSelect';
import { SERIES_SORT_OPTIONS } from '@/domain/series/sorting';
import type { SeriesSort } from '@/domain/series/types';

type Props = { value: SeriesSort; onChange: (sort: SeriesSort) => void };

export default function SeriesSortSelect({ value, onChange }: Props) {
    const t = useTranslations('series');
    return <NameCountSortSelect value={value} options={SERIES_SORT_OPTIONS} label={t('sortSeries.label')} onChange={onChange} />;
}
