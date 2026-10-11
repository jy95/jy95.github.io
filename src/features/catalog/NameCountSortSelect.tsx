"use client";

import { useTranslations } from 'next-intl';

import SortControl from '@/components/common/SortControl';
import type { SortDirection } from '@/components/common/SortControl';

export type NameCountSort = "nameAsc" | "nameDesc" | "countAsc" | "countDesc";

type Props<S extends NameCountSort> = {
    value: S; options: readonly S[]; label: string; onChange: (sort: S) => void;
};

export default function NameCountSortSelect<S extends NameCountSort>({ value, options, label, onChange }: Props<S>) {
    const commonSort = useTranslations('common.sort');
    const field = value.startsWith('name') ? 'name' : 'count';
    const direction = value.endsWith('Desc') ? 'desc' : 'asc';
    const changeSort = (field: string, direction: SortDirection) => {
        const sort = options.find(option => option === `${field}${direction === 'asc' ? 'Asc' : 'Desc'}`);
        if (sort) onChange(sort);
    };

    return (
        <SortControl field={field} direction={direction} label={label}
            options={[
                { value: 'name', label: commonSort('fields.name') },
                { value: 'count', label: commonSort('fields.count') },
            ]}
            directionLabels={{ asc: commonSort('direction.asc'), desc: commonSort('direction.desc') }}
            onFieldChange={field => changeSort(field, direction)}
            onDirectionChange={direction => changeSort(field, direction)} />
    );
}
