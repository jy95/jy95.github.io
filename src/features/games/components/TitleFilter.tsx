"use client";

import { useTranslations } from 'next-intl';
import TextField from '@mui/material/TextField';

type Props = { value: string; onChange: (title: string) => void };

export default function TitleFilter({ value, onChange }: Props) {
    const t = useTranslations('gamesLibrary.filtersLabels');
    return (
        <TextField
            id="search-game-title"
            label={t('title')}
            fullWidth
            value={value}
            onChange={event => onChange(event.target.value)}
        />
    );
}
