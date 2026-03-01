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
import type { CardGame } from "@/redux/sharedDefintion";

function GameToolbar({ game, onClose }: { game: CardGame, onClose: () => void }) {

    // hooks
    const router = useRouter();

    function watchGame() {
        router.push({
            pathname: game.url_type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: game.id }
        });
    }

    function isPublic() {
        // if no release date, consider it private
        if (!game.availableAt) return false;
        // if availableAt is in the future, consider it private
        const now = new Date();
        const availableDate = new Date(game.availableAt);
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