"use client";

import { useId, type ReactNode } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

type Props = {
    label: string;
    value: string;
    options: readonly { value: string; label: string }[];
    onChange: (value: string) => void;
    startIcon?: ReactNode;
};

/** One labelled field and change handler, with the platform picker below md. */
export default function ResponsiveSelect({ label, value, options, onChange, startIcon }: Props) {
    const id = useId();
    const theme = useTheme();
    const native = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <TextField
            select
            fullWidth
            size="small"
            id={id}
            label={label}
            value={value}
            onChange={event => onChange(event.target.value)}
            slotProps={{
                inputLabel: { shrink: true },
                input: {
                    startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
                },
                select: { native, ...(native ? {} : { displayEmpty: true }) },
            }}
            sx={{
                minWidth: 0,
                '& .MuiInputBase-root': { minHeight: 44 },
                '& .MuiSelect-select, & .MuiNativeSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            }}
        >
            {options.map(option => native ? (
                <option key={option.value} value={option.value}>{option.label}</option>
            ) : (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
        </TextField>
    );
}
