"use client";

import { useTranslations } from 'next-intl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SortIcon from '@mui/icons-material/Sort';
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
            size="small"
            id="select-game-sort"
            label={t('sortForm.firstSort')}
            value={value ?? ''}
            onChange={event => onChange(GAME_SORT_OPTIONS.find(option => option === event.target.value))}
            slotProps={{
                inputLabel: { shrink: true },
                input: {
                    startAdornment: <InputAdornment position="start"><SortIcon fontSize="small" /></InputAdornment>,
                },
                select: { displayEmpty: true },
            }}
            sx={{
                minWidth: 0,
                '& .MuiInputBase-root': { minHeight: 44 },
                '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            }}
        >
            <MenuItem value="">—</MenuItem>
            {GAME_SORT_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{labels[option]}</MenuItem>
            ))}
        </TextField>
    );
}
