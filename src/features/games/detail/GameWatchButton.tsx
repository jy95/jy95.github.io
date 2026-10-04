import { useTranslations } from 'next-intl';
import IconButton from '@mui/material/IconButton';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { availableWatchRoute } from '@/domain/games/watch';
import { useRouter } from '@/i18n/routing';
import type { RawGameDetailsEntry } from './adapters';

type GameWatchButtonProps = {
    game: RawGameDetailsEntry;
    isPage: boolean;
    isPublished: boolean;
};

export default function GameWatchButton({ game, isPage, isPublished }: GameWatchButtonProps) {
    const router = useRouter();
    const t = useTranslations('gameDetail');
    const route = availableWatchRoute(game, { publishedOnly: isPage, isPublished });
    if (!route) return null;

    return (
        <IconButton
            edge={isPage ? false : 'end'}
            color="inherit"
            onClick={() => router.push(route)}
            aria-label={t('watch')}
        >
            <YouTubeIcon />
        </IconButton>
    );
}
