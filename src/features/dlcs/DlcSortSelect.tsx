"use client";

import { useTranslations } from 'next-intl';

import NameCountSortSelect from '@/features/catalog/NameCountSortSelect';
import { DLC_SORT_OPTIONS } from '@/domain/dlcs/sorting';
import type { DlcSort } from '@/domain/dlcs/types';

type Props = { value: DlcSort; onChange: (sort: DlcSort) => void };

export default function DlcSortSelect({ value, onChange }: Props) {
    const t = useTranslations('dlcs');
    return <NameCountSortSelect value={value} options={DLC_SORT_OPTIONS} label={t('sortDlcs.label')} onChange={onChange} />;
}
