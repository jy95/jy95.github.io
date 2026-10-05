import { useTranslations } from 'next-intl';

import SortControl from '@/components/common/SortControl';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { SortDirection } from '@/components/common/SortControl';
import type { GameSort } from '@/types/gamesFilters';

type SortField = GameSort extends `${infer Field}_${'asc' | 'desc'}` ? Field : never;
const SORT_FIELDS = ['title', 'releaseDate', 'duration'] as const satisfies readonly SortField[];

type Props = { value?: GameSort; onChange: (sort: GameSort | undefined) => void };

export default function SortSelect({ value, onChange }: Props) {
    const t = useTranslations('gamesLibrary');
    const field = value?.split('_')[0] ?? '';
    const direction = value?.endsWith('_desc') ? 'desc' : 'asc';
    const labels = {
        title: t('sortLabels.name'),
        releaseDate: t('sortLabels.releaseDate'),
        duration: t('sortLabels.duration'),
    } satisfies Record<SortField, string>;
    const changeSort = (nextField: string, nextDirection: SortDirection) => {
        onChange(GAME_SORT_OPTIONS.find(option => option === `${nextField}_${nextDirection}`));
    };

    return (
        <SortControl field={field} direction={direction} label={t('sortForm.firstSort')}
            options={[
                { value: '', label: t('sortLabels.default') },
                ...SORT_FIELDS.map(value => ({ value, label: labels[value] })),
            ]}
            directionLabels={{ asc: t('sortDirection.asc'), desc: t('sortDirection.desc') }}
            directionDisabled={!value}
            onFieldChange={field => changeSort(field, direction)}
            onDirectionChange={direction => changeSort(field, direction)} />
    );
}
