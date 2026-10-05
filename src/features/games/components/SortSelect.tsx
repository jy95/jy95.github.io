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
    const commonSort = useTranslations('common.sort');
    const field = value?.split('_')[0] ?? '';
    const direction = value?.endsWith('_desc') ? 'desc' : 'asc';
    const labels = {
        title: commonSort('fields.name'),
        releaseDate: commonSort('fields.releaseDate'),
        duration: commonSort('fields.duration'),
    } satisfies Record<SortField, string>;
    const changeSort = (nextField: string, nextDirection: SortDirection) => {
        onChange(GAME_SORT_OPTIONS.find(option => option === `${nextField}_${nextDirection}`));
    };

    return (
        <SortControl field={field} direction={direction} label={t('sortForm.firstSort')}
            options={[
                { value: '', label: commonSort('fields.default') },
                ...SORT_FIELDS.map(value => ({ value, label: labels[value] })),
            ]}
            directionLabels={{ asc: commonSort('direction.asc'), desc: commonSort('direction.desc') }}
            directionDisabled={!value}
            onFieldChange={field => changeSort(field, direction)}
            onDirectionChange={direction => changeSort(field, direction)} />
    );
}
