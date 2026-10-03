'use client';

import { memo } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useTranslations } from 'next-intl';
import { toggleSelection } from './selectionPersistence';
import { useIsSelected, useSelectionWritable } from './selectionHooks';
import type { SelectionCategory } from './documentTypes';

type Props = { id: string; title: string; category: SelectionCategory };

const SelectionButton = memo(function SelectionButton({ id, title, category }: Props) {
    const t = useTranslations('selection');
    const selected = useIsSelected(id, category);
    const writable = useSelectionWritable();
    const label = t(selected ? 'remove' : 'add', { title });

    return (
        <Tooltip title={label}>
            <span>
                <IconButton
                    aria-label={label}
                    aria-pressed={selected}
                    disabled={!writable}
                    onClick={event => { event.stopPropagation(); toggleSelection({ id, category }); }}
                    sx={{ minWidth: 44, minHeight: 44, bgcolor: 'background.paper', color: selected ? 'primary.main' : 'text.primary', '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
                >
                    {selected ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
            </span>
        </Tooltip>
    );
});

export default SelectionButton;