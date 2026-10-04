import { useId, type ReactNode } from 'react';
import TextField from '@mui/material/TextField';
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
    value: string;
    onChange: (value: string) => void;
};

function OptionLabel({ option }: { option: Option }) {
    return <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        {option.icon && <span aria-hidden="true">{option.icon}</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
    </Stack>;
}

/** One labelled field and change handler, with the platform picker below md. */
export default function ResponsiveSelect(props: Props) {
    const { label, value, options, startIcon, onChange } = props;
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
                inputLabel: { shrink: true, id: `${id}-label` },
                input: {
                    startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
                },
                select: {
                    native, labelId: `${id}-label`,
                    ...(native ? {} : { displayEmpty: true }),
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
                    <OptionLabel option={option} />
                </MenuItem>
            ))}
        </TextField>
    );
}
