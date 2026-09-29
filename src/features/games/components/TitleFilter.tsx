"use client";

import { useEffect, useEffectEvent, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslations } from 'next-intl';
import TextField from '@mui/material/TextField';

type Props = { value: string; onChange: (title: string) => void };

export default function TitleFilter({ value, onChange }: Props) {
    const t = useTranslations('gamesLibrary.filtersLabels');
    const [input, setInput] = useState({ source: value, text: value });
    // Back/forward or another external title update cancels any pending edit.
    if (input.source !== value) setInput({ source: value, text: value });
    const publish = useEffectEvent((title: string) => onChange(title));
    useEffect(() => {
        if (input.text === value) return;
        const timer = setTimeout(() => publish(input.text), 300);
        return () => clearTimeout(timer);
    }, [input.text, value]);

    return (
        <TextField
            id="search-game-title"
            label={t('title')}
            fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            value={input.text}
            onChange={event => setInput({ source: value, text: event.target.value })}
        />
    );
}
