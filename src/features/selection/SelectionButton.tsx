'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { SelectionCategory } from './documentTypes';
import { selectSelectedIdSet, toggleSelection } from './selectionSlice';

export default function SelectionButton({ id, title, category }: { id: string; title: string; category?: SelectionCategory }) {
    const t = useTranslations('selection');
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => selectSelectedIdSet(state).has(id));
    const hydrated = useAppSelector(state => state.selection.hydrated);
    const label = t(selected ? 'remove' : 'add', { title });
    return (
        <Tooltip title={label}>
            <span>
                <IconButton
                    aria-label={label}
                    aria-pressed={selected}
                    disabled={!hydrated}
                    onClick={event => { event.stopPropagation(); dispatch(toggleSelection(category ? { id, category } : id)); }}
                    sx={{ minWidth: 44, minHeight: 44, bgcolor: 'background.paper', color: selected ? 'primary.main' : 'text.primary', '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
                >
                    {selected ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
            </span>
        </Tooltip>
    );
}