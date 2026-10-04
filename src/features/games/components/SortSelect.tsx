import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SortIcon from '@mui/icons-material/Sort';
import { useTranslations } from 'next-intl';
import ResponsiveSelect from '@/components/common/ResponsiveSelect';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameSort } from '@/types/gamesFilters';

type SortField = GameSort extends `${infer Field}_${'asc' | 'desc'}` ? Field : never;
const SORT_FIELDS = [...new Set(GAME_SORT_OPTIONS.map(sort => sort.split('_')[0] as SortField))];

type Props = { value?: GameSort; onChange: (sort: GameSort | undefined) => void };

export default function SortSelect({ value, onChange }: Props) {
    const t = useTranslations('gamesLibrary');
    const field = value?.split('_')[0] ?? '';
    const direction = value?.endsWith('_desc') ? 'desc' : 'asc';
    const nextDirection = direction === 'asc' ? 'desc' : 'asc';
    const directionAction = t(`sortDirection.${nextDirection}`);
    const labels = {
        title: t('sortLabels.name'),
        releaseDate: t('sortLabels.releaseDate'),
        duration: t('sortLabels.duration'),
    } satisfies Record<SortField, string>;
    const changeSort = (nextField: string, nextDirection: 'asc' | 'desc') => {
        onChange(GAME_SORT_OPTIONS.find(option => option === `${nextField}_${nextDirection}`));
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <ResponsiveSelect
                label={t('sortForm.firstSort')}
                value={field}
                options={[
                    { value: '', label: t('sortLabels.default') },
                    ...SORT_FIELDS.map(value => ({ value, label: labels[value] })),
                ]}
                onChange={field => changeSort(field, direction)}
                startIcon={<SortIcon fontSize="small" />}
            />
            <Tooltip title={directionAction} describeChild>
                <span>
                    <IconButton
                        aria-label={directionAction}
                        disabled={!value}
                        onClick={() => changeSort(field, nextDirection)}
                        sx={{ minWidth: 44, minHeight: 44 }}
                    >
                        {direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}
