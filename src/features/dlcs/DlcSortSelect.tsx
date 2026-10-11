"use client";

import { useTranslations } from 'next-intl';

import SortControl from '@/components/common/SortControl';
import { DLC_SORT_OPTIONS } from '@/domain/dlcs/sorting';
import type { SortDirection } from '@/components/common/SortControl';
import type { DlcSort } from '@/domain/dlcs/types';

type Props = { value: DlcSort; onChange: (sort: DlcSort) => void };

export default function DlcSortSelect({ value, onChange }: Props) {
    const t = useTranslations('dlcs');
    const commonSort = useTranslations('common.sort');
    const field = value.startsWith('name') ? 'name' : 'count';
    const direction = value.endsWith('Desc') ? 'desc' : 'asc';
    const changeSort = (field: string, direction: SortDirection) => {
        const sort = DLC_SORT_OPTIONS.find(option => option === `${field}${direction === 'asc' ? 'Asc' : 'Desc'}`);
        if (sort) onChange(sort);
    };

    return (
        <SortControl field={field} direction={direction} label={t('sortDlcs.label')}
            options={[
                { value: 'name', label: commonSort('fields.name') },
                { value: 'count', label: commonSort('fields.count') },
            ]}
            directionLabels={{ asc: commonSort('direction.asc'), desc: commonSort('direction.desc') }}
            onFieldChange={field => changeSort(field, direction)}
            onDirectionChange={direction => changeSort(field, direction)} />
    );
}
