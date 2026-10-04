import { useTranslations } from 'next-intl';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';

import type { SelectionCategory } from '@/domain/selection/types';
import { buildWatchRoute } from '@/domain/games/youtube';
import { useRouter } from '@/i18n/routing';
import SelectionButton from '@/features/selection/components/SelectionButton';

import { isCardGame } from './adapters';
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

function getCategory(
    game: RawGameDetailsEntry,
    category?: SelectionCategory,
): SelectionCategory {
    if (category) return category;

    if (!isCardGame(game)) return 'backlog';

    return 'status' in game ? 'planning' : 'games';
}

function isPublic(
    game: RawGameDetailsEntry,
    isPage: boolean,
    isPublished: boolean,
): boolean {
    if (!isCardGame(game)) return false;

    if (isPage || isPublished) return isPublished;

    if (!game.availableAt) return false;

    return new Date(game.availableAt) <= new Date();
}

function WatchButton({
    game,
    isPage,
    onWatch,
}: {
    game: RawGameDetailsEntry;
    isPage: boolean;
    onWatch: () => void;
}) {
    const t = useTranslations('gameDetail');

    if (!isPublic(game, isPage, true)) return null;

    return (
        <IconButton
            edge={isPage ? false : 'end'}
            color="inherit"
            onClick={onWatch}
            aria-label={t('watch')}
        >
            <YouTubeIcon />
        </IconButton>
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
    const router = useRouter();
    const t = useTranslations('gameDetail');

    const resolvedCategory = getCategory(game, category);

    function watchGame() {
        if (isCardGame(game)) {
            router.push(buildWatchRoute(game.url_type, game.id));
        }
    }

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

            <Typography
                sx={{
                    ml: isPage ? 0 : 2,
                    flex: 1,
                    minWidth: 0,
                    overflowWrap: 'anywhere',
                }}
                variant={isPage ? 'h5' : 'h6'}
                component={isPage ? 'h1' : 'div'}
            >
                {game.title}
            </Typography>

            {selectable && (
                <SelectionButton
                    id={game.id}
                    category={resolvedCategory}
                    title={game.title}
                />
            )}

            {isPublic(game, isPage, isPublished) && (
                <IconButton
                    edge={isPage ? false : 'end'}
                    color="inherit"
                    onClick={watchGame}
                    aria-label={t('watch')}
                >
                    <YouTubeIcon />
                </IconButton>
            )}
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