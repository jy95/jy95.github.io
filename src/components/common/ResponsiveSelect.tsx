"use client";

import { useId, type ReactNode } from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

type Option = { value: string; label: string; icon?: ReactNode };
type Props = {
    label: string;
    options: readonly Option[];
    startIcon?: ReactNode;
} & (
    | { multiple?: false; value: string; onChange: (value: string) => void }
    | { multiple: true; value: readonly string[]; onChange: (value: string[]) => void }
);

function OptionLabel({ option }: { option: Option }) {
    return <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        {option.icon && <span aria-hidden="true">{option.icon}</span>}
        <span>{option.label}</span>
    </Stack>;
}

/** One labelled field and change handler, with the platform picker below md. */
export default function ResponsiveSelect(props: Props) {
    const { label, value, options, startIcon, multiple = false } = props;
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
            onChange={event => {
                if (!props.multiple) {
                    props.onChange(event.target.value);
                    return;
                }
                if (event.target instanceof HTMLSelectElement) {
                    props.onChange(Array.from(event.target.selectedOptions, option => option.value));
                    return;
                }
                const selected = event.target.value;
                props.onChange(typeof selected === 'string' ? selected.split(',') : selected);
            }}
            slotProps={{
                inputLabel: { shrink: true, id: `${id}-label` },
                input: {
                    startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
                },
                select: {
                    native, multiple, labelId: `${id}-label`,
                    ...(native ? {} : {
                        displayEmpty: true,
                        ...(multiple ? { renderValue: (selected: unknown) => <Stack direction="row" spacing={1}>
                            {options.filter(option => (selected as string[]).includes(option.value)).map(option => <OptionLabel key={option.value} option={option} />)}
                        </Stack> } : {}),
                    }),
                },
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
                <MenuItem key={option.value} value={option.value}>
                    {multiple && <Checkbox checked={value.includes(option.value)} tabIndex={-1}
                        slotProps={{ input: { 'aria-hidden': true } }} sx={{ pointerEvents: 'none' }} />}
                    <OptionLabel option={option} />
                </MenuItem>
            ))}
        </TextField>
    );
}
