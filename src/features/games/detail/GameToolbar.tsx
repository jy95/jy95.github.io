import { useTranslations } from 'next-intl';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

import type { SelectionCategory } from '@/domain/selection/types';
import { selectionCategoryForGame } from '@/domain/selection/gameCategory';
import SelectionButton from '@/features/selection/components/SelectionButton';

import GameWatchButton from './GameWatchButton';
import type { RawGameDetailsEntry } from './adapters';

type Presentation = 'dialog' | 'page';

type GameToolbarProps = {
    game: RawGameDetailsEntry;
    category?: SelectionCategory;
    onClose: () => void;
    presentation?: Presentation;
    isPublished?: boolean;
    selectable?: boolean;
};

type ToolbarContentProps = {
    game: RawGameDetailsEntry;
    category?: SelectionCategory;
    onClose: () => void;
    isPage: boolean;
    isPublished: boolean;
    selectable: boolean;
};

function ToolbarTitle({ title, isPage }: { title: string; isPage: boolean }) {
    return (
        <Typography
            sx={{ ml: isPage ? 0 : 2, flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
            variant={isPage ? 'h5' : 'h6'}
            component={isPage ? 'h1' : 'div'}
        >
            {title}
        </Typography>
    );
}

function ToolbarContent({
    game,
    category,
    onClose,
    isPage,
    isPublished,
    selectable,
}: ToolbarContentProps) {
    const t = useTranslations('gameDetail');

    return (
        <>
            <IconButton
                edge={isPage ? false : 'start'}
                color="inherit"
                onClick={onClose}
                aria-label={t(isPage ? 'back' : 'close')}
            >
                {isPage ? <ArrowBackIcon /> : <CloseIcon />}
            </IconButton>

            <ToolbarTitle title={game.title} isPage={isPage} />

            {selectable && (
                <SelectionButton
                    id={game.id}
                    category={category ?? selectionCategoryForGame(game)}
                    title={game.title}
                />
            )}

            <GameWatchButton game={game} isPage={isPage} isPublished={isPublished} />
        </>
    );
}

export default function GameToolbar({
    game,
    category,
    onClose,
    presentation = 'dialog',
    isPublished = false,
    selectable = true,
}: GameToolbarProps) {
    const isPage = presentation === 'page';

    const content = (
        <ToolbarContent
            game={game}
            category={category}
            onClose={onClose}
            isPage={isPage}
            isPublished={isPublished}
            selectable={selectable}
        />
    );

    if (isPage) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                }}
            >
                {content}
            </Box>
        );
    }

    return (
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>{content}</Toolbar>
        </AppBar>
    );
}
