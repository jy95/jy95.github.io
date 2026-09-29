"use client";

import { useId, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslations } from 'next-intl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SortIcon from '@mui/icons-material/Sort';
import { GAME_SORT_OPTIONS } from '@/types/gamesFilters';
import type { GameSort } from '@/types/gamesFilters';

type Props = { compact?: boolean; value?: GameSort; onChange: (sort: GameSort | undefined) => void };

export default function SortSelect({ value, onChange, compact = false }: Props) {
    const t = useTranslations('gamesLibrary');
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const menuId = useId();
    const triggerId = useId();
    const labels = {
        title_asc: `${t('sortLabels.name')} ↑`,
        title_desc: `${t('sortLabels.name')} ↓`,
        releaseDate_asc: `${t('sortLabels.releaseDate')} ↑`,
        releaseDate_desc: `${t('sortLabels.releaseDate')} ↓`,
        duration_asc: `${t('sortLabels.duration')} ↑`,
        duration_desc: `${t('sortLabels.duration')} ↓`,
    };

    if (compact) return (
        <>
            <Button
                id={triggerId}
                startIcon={<SortIcon />}
                aria-label={`${t('sortForm.firstSort')}: ${value ? labels[value] : t('sortLabels.default')}`}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                aria-controls={anchor ? menuId : undefined}
                onClick={event => setAnchor(event.currentTarget)}
                sx={{ minHeight: 44 }}
            >
                {t('sortForm.sortButton')}
            </Button>
            <Menu id={menuId} anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ list: { 'aria-labelledby': triggerId } }}>
                {[undefined, ...GAME_SORT_OPTIONS].map(option => (
                    <MenuItem
                        key={option ?? 'default'}
                        selected={value === option}
                        role="menuitemradio"
                        aria-checked={value === option}
                        onClick={() => { onChange(option); setAnchor(null); }}
                        sx={{ gap: 1, minHeight: 44 }}
                    >
                        <CheckIcon fontSize="small" sx={{ visibility: value === option ? 'visible' : 'hidden' }} />
                        {option ? labels[option] : t('sortLabels.default')}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );

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
            <MenuItem value="">{t("sortLabels.default")}</MenuItem>
            {GAME_SORT_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{labels[option]}</MenuItem>
            ))}
        </TextField>
    );
}
