"use client";

import { useTranslations } from 'next-intl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameSort } from '@/types/gamesFilters';

type Props = { value?: GameSort; onChange: (sort: GameSort | undefined) => void };

export default function SortSelect({ value, onChange }: Props) {
    const t = useTranslations('gamesLibrary');
    const labels = {
        title_asc: `${t('sortLabels.name')} ↑`,
        title_desc: `${t('sortLabels.name')} ↓`,
        releaseDate_asc: `${t('sortLabels.releaseDate')} ↑`,
        releaseDate_desc: `${t('sortLabels.releaseDate')} ↓`,
        duration_asc: `${t('sortLabels.duration')} ↑`,
        duration_desc: `${t('sortLabels.duration')} ↓`,
    };

    return (
        <TextField
            select
            fullWidth
            id="select-game-sort"
            label={t('sortForm.firstSort')}
            value={value ?? ''}
            onChange={event => onChange(GAME_SORT_OPTIONS.find(option => option === event.target.value))}
        >
            <MenuItem value="">—</MenuItem>
            {GAME_SORT_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{labels[option]}</MenuItem>
            ))}
        </TextField>
    );
}
