"use client";

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SortIcon from '@mui/icons-material/Sort';
import ResponsiveSelect from './ResponsiveSelect';

export type SortDirection = 'asc' | 'desc';
type Props = {
    options: readonly { value: string; label: string }[];
    field: string;
    direction: SortDirection;
    label: string;
    directionLabels: Record<SortDirection, string>;
    directionDisabled?: boolean;
    onFieldChange: (field: string) => void;
    onDirectionChange: (direction: SortDirection) => void;
};

export default function SortControl({ options, field, direction, label, directionLabels,
    directionDisabled = false, onFieldChange, onDirectionChange }: Props) {
    const nextDirection = direction === 'asc' ? 'desc' : 'asc';
    const action = directionLabels[nextDirection];
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <ResponsiveSelect label={label} value={field} options={options}
                onChange={onFieldChange} startIcon={<SortIcon fontSize="small" />} />
            <Tooltip title={action} describeChild>
                <span>
                    <IconButton aria-label={action} disabled={directionDisabled}
                        onClick={() => onDirectionChange(nextDirection)} sx={{ minWidth: 44, minHeight: 44 }}>
                        {direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}
