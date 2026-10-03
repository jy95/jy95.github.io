'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useTranslations } from 'next-intl';
import { usePersonalSelection, toggleSelection } from './selectionPersistence';
import type { SelectionCategory } from './documentTypes';

export default function SelectionButton({ id, title, category }: { id: string; title: string; category: SelectionCategory }) {
    const t = useTranslations('selection');
    const { document, hydrated, storageAvailable } = usePersonalSelection();
    const selected = document[category].includes(id);
    const label = t(selected ? 'remove' : 'add', { title });
    return (
        <Tooltip title={label}>
            <span>
                <IconButton
                    aria-label={label}
                    aria-pressed={selected}
                    disabled={!hydrated || !storageAvailable}
                    onClick={event => { event.stopPropagation(); toggleSelection({ id, category }); }}
                    sx={{ minWidth: 44, minHeight: 44, bgcolor: 'background.paper', color: selected ? 'primary.main' : 'text.primary', '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
                >
                    {selected ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
            </span>
        </Tooltip>
    );
}