"use client";

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SortIcon from '@mui/icons-material/Sort';

import ResponsiveSelect from '@/components/common/ResponsiveSelect';
import { SERIES_SORT_OPTIONS } from '@/domain/series/sorting';
import type { SeriesSort } from '@/domain/series/types';

type Props = { value: SeriesSort; onChange: (sort: SeriesSort) => void };

export default function SeriesSortSelect({ value, onChange }: Props) {
    const t = useTranslations('series');
    const field = value.startsWith('name') ? 'name' : 'count';
    const direction = value.endsWith('Desc') ? 'Desc' : 'Asc';
    const nextDirection = direction === 'Asc' ? 'Desc' : 'Asc';
    const directionAction = t(`sortSeries.direction.${nextDirection === 'Asc' ? 'asc' : 'desc'}`);
    const changeSort = (field: string, direction: 'Asc' | 'Desc') => {
        const sort = SERIES_SORT_OPTIONS.find(option => option === `${field}${direction}`);
        if (sort) onChange(sort);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <ResponsiveSelect
                label={t('sortSeries.label')}
                value={field}
                options={[
                    { value: 'name', label: t('sortSeries.name') },
                    { value: 'count', label: t('sortSeries.count') },
                ]}
                onChange={field => changeSort(field, direction)}
                startIcon={<SortIcon fontSize="small" />}
            />
            <Tooltip title={directionAction} describeChild>
                <span>
                    <IconButton
                        aria-label={directionAction}
                        onClick={() => changeSort(field, nextDirection)}
                        sx={{ minWidth: 44, minHeight: 44 }}
                    >
                        {direction === 'Asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}
