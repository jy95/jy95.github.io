import { useTranslations } from "next-intl";
import SelectionButton from "@/features/selection/SelectionButton";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

// Others
import { buildWatchRoute } from "@/domain/games/youtube";

// Types
import { isCardGame } from "./adapters";
import type { RawGameDetailsEntry } from "./adapters";

function GameToolbar({ game, onClose, presentation = "dialog", isPublished = false }: {
    game: RawGameDetailsEntry;
    onClose: () => void;
    presentation?: "dialog" | "page";
    /** The published catalogue omits availableAt. Its membership confirms availability. */
    isPublished?: boolean;
}) {

    const router = useRouter();
    const t = useTranslations("gameDetail");
    const isPage = presentation === "page";

    function watchGame() {
        if (isCardGame(game)) {
            router.push(buildWatchRoute(game.url_type, game.id));
        }
    }

    function isPublic() {
        if (!isCardGame(game)) return false;
        if (isPage) return isPublished;
        if (isPublished) return true;
        const availableAt = game.availableAt;
        if (!availableAt) return false;
        const now = new Date();
        const availableDate = new Date(availableAt);
        if (availableDate > now) return false;
        return true;
    }

    const content = (
        <>
            <IconButton
                edge={isPage ? false : "start"}
                color="inherit"
                onClick={onClose}
                aria-label={t(isPage ? "back" : "close")}
            >
                {isPage ? <ArrowBackIcon /> : <CloseIcon />}
            </IconButton>
            <Typography sx={{ ml: isPage ? 0 : 2, flex: 1, minWidth: 0, overflowWrap: "anywhere" }} variant={isPage ? "h5" : "h6"} component={isPage ? "h1" : "div"}>
                {game.title}
            </Typography>
            <SelectionButton id={game.id} category={isCardGame(game) ? undefined : 'backlog'} title={game.title} />
            {isPublic() && (
                <IconButton
                    edge={isPage ? false : "end"}
                    color="inherit"
                    onClick={watchGame}
                    aria-label={t("watch")}
                >
                    <YouTubeIcon />
                </IconButton>
            )}
        </>
    );

    return isPage ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            {content}
        </Box>
    ) : (
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>{content}</Toolbar>
        </AppBar>
    );
}

export default GameToolbar;
