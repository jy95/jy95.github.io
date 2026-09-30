"use client";

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { getMaxReleaseYear, getReleaseYearRange, MIN_RELEASE_YEAR } from '@/lib/gamesFilterUtils';
import type { GameFilters } from '@/types/gamesFilters';

type Props = {
    filters: GameFilters;
    onChange: (changes: Partial<GameFilters>) => void;
};

export default function ReleaseDateFilter({ filters, onChange }: Props) {
    const t = useTranslations('gamesLibrary.releasePeriod');
    const labelId = useId();
    const maxYear = getMaxReleaseYear();
    const value = getReleaseYearRange(filters);
    // Omit a decade label too near the current year to keep mobile marks readable.
    const marks = [];
    for (let year = Math.ceil(MIN_RELEASE_YEAR / 10) * 10; year < maxYear - 3; year += 10) {
        marks.push({ value: year, label: String(year) });
    }
    marks.push({ value: maxYear, label: String(maxYear) });

    return (
        <Box role="group" aria-labelledby={labelId} sx={{ minWidth: 0, px: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography id={labelId} variant="body2" color="text.secondary">{t('label')}</Typography>
                <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {value[0]}–{value[1]}
                </Typography>
            </Box>
            <Slider
                getAriaLabel={index => t(index === 0 ? 'from' : 'to')}
                getAriaValueText={year => String(year)}
                min={MIN_RELEASE_YEAR}
                max={maxYear}
                step={1}
                shiftStep={1}
                value={value}
                marks={marks}
                valueLabelDisplay="auto"
                disableSwap
                onChange={(_event, years) => {
                    if (Array.isArray(years)) onChange({ releaseDateFrom: years[0], releaseDateTo: years[1] });
                }}
                sx={{ mb: 1 }}
            />
        </Box>
    );
}
