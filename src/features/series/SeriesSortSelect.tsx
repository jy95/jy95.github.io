"use client";

import { useTranslations } from 'next-intl';

import SortControl from '@/components/common/SortControl';
import { SERIES_SORT_OPTIONS } from '@/domain/series/sorting';
import type { SortDirection } from '@/components/common/SortControl';
import type { SeriesSort } from '@/domain/series/types';

type Props = { value: SeriesSort; onChange: (sort: SeriesSort) => void };

export default function SeriesSortSelect({ value, onChange }: Props) {
    const t = useTranslations('series');
    const field = value.startsWith('name') ? 'name' : 'count';
    const direction = value.endsWith('Desc') ? 'desc' : 'asc';
    const changeSort = (field: string, direction: SortDirection) => {
        const sort = SERIES_SORT_OPTIONS.find(option => option === `${field}${direction === 'asc' ? 'Asc' : 'Desc'}`);
        if (sort) onChange(sort);
    };

    return (
        <SortControl field={field} direction={direction} label={t('sortSeries.label')}
            options={[
                { value: 'name', label: t('sortSeries.name') },
                { value: 'count', label: t('sortSeries.count') },
            ]}
            directionLabels={{ asc: t('sortSeries.direction.asc'), desc: t('sortSeries.direction.desc') }}
            onFieldChange={field => changeSort(field, direction)}
            onDirectionChange={direction => changeSort(field, direction)} />
    );
}
