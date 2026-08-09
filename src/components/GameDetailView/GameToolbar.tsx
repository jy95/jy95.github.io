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
import { isCardGame } from "./adapters";
import type { RawGameDetailsEntry } from "./adapters";

function GameToolbar({ game, onClose }: { game: RawGameDetailsEntry, onClose: () => void }) {

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
        if (!isCardGame(game)) return false;
        const availableAt = game.availableAt;
        if (!availableAt) return false;
        const now = new Date();
        const availableDate = new Date(availableAt);
        if (availableDate > now) return false;
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