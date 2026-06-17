// Hooks
import { useRouter } from '@/i18n/routing';

// Material UI
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";

// Icons
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';

// Types
import type { BacklogEntry } from "@/app/api/backlog/route";
import type { CardGame } from "@/redux/sharedDefintion";

// Many fields are optional
type GameDetailsEntry = BacklogEntry | CardGame;

function isCardGame(game: GameDetailsEntry): game is CardGame {
    return (game as CardGame).url_type !== undefined;
}

function GameToolbar({ game, onClose }: { game: GameDetailsEntry, onClose: () => void }) {

    // hooks
    const router = useRouter();

    function watchGame() {
        if (isCardGame(game)) {
            router.push({
                pathname: game.url_type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
                params: { id: game.id }
            });
        }
    }

    function isPublic() {
        // if no release date, consider it private
        if (!isCardGame(game)) return false;
        const availableAt = game.availableAt;
        if (!availableAt) return false;
        // if availableAt is in the future, consider it private
        const now = new Date();
        const availableDate = new Date(availableAt);
        if (availableDate > now) return false;
        // otherwise, consider it public
        return true;
    }

    return (
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    {game.title}
                </Typography>
                {isPublic() && (
                    <IconButton 
                        edge="end"
                        color="inherit"
                        onClick={watchGame}
                        aria-label="watch"
                    >
                        <YouTubeIcon />
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default GameToolbar;